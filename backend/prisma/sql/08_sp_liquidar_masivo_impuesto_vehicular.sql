-- ============================================================================
-- PROCEDIMIENTO / FUNCIÓN: fn_liquidar_masivo_impuestos
-- DESCRIPCIÓN: Ejecuta la liquidación masiva del impuesto vehicular para todo el
--              parque automotor activo del municipio según las tarifas del año fiscal.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_liquidar_masivo_impuestos(
    p_vigencia INT,
    p_fecha_corte DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_start_time TIMESTAMPTZ := clock_timestamp();
    v_param RECORD;
    v_vehiculo RECORD;
    v_avaluo NUMERIC;
    v_avaluo_uvt NUMERIC;
    v_tarifa_pct NUMERIC;
    v_valor_base NUMERIC;
    v_descuento_pp NUMERIC;
    v_sancion_extemp NUMERIC;
    v_intereses_mora NUMERIC;
    v_total_pagar NUMERIC;
    v_estado TEXT;
    v_count_procesados INT := 0;
    v_count_al_dia INT := 0;
    v_count_en_mora INT := 0;
    v_total_recaudo_proyectado NUMERIC := 0;
    v_total_descuentos_estimados NUMERIC := 0;
    v_total_moras_liquidadas NUMERIC := 0;
    v_duracion_ms NUMERIC;
BEGIN
    -- 1. Consultar parámetros fiscales anuales de la vigencia
    SELECT * INTO v_param
    FROM "ParametroAnual"
    WHERE "vigenciaFiscal" = p_vigencia AND activo = true
    LIMIT 1;

    IF v_param IS NULL THEN
        RETURN jsonb_build_object('error', 'No se encontraron parámetros anuales configurados para la vigencia ' || p_vigencia);
    END IF;

    -- 2. Recorrer todos los vehículos con matrícula activa
    FOR v_vehiculo IN
        SELECT id, placa, marca, linea, modelo, cilindraje, "tipoVehiculo", "claseServicio"
        FROM "Vehiculo"
        WHERE estado = 'ACTIVO'
    LOOP
        -- Estimar avalúo comercial basado en modelo y cilindraje
        v_avaluo := (CASE WHEN v_vehiculo.modelo >= (p_vigencia - 4) THEN 65000000 ELSE 35000000 END)
                    + (v_vehiculo.cilindraje * 1200);

        -- Determinar Tarifa según Rangos en UVT
        IF v_vehiculo."claseServicio" = 'PUBLICO' OR v_vehiculo."tipoVehiculo" = 'MOTOCICLETA' THEN
            v_tarifa_pct := 1.5;
        ELSE
            v_avaluo_uvt := v_avaluo / v_param."uvtValor";

            SELECT "porcentajeTarifa" INTO v_tarifa_pct
            FROM "RangoTarifaImpuesto"
            WHERE "vigenciaFiscal" = p_vigencia
              AND v_avaluo_uvt >= "rangoDesdeUVT"
              AND (v_avaluo_uvt < "rangoHastaUVT" OR "rangoHastaUVT" = 0)
            LIMIT 1;

            IF v_tarifa_pct IS NULL THEN
                IF v_avaluo_uvt <= 1184 THEN
                    v_tarifa_pct := 1.5;
                ELSIF v_avaluo_uvt <= 2664 THEN
                    v_tarifa_pct := 2.5;
                ELSE
                    v_tarifa_pct := 3.5;
                END IF;
            END IF;
        END IF;

        v_valor_base := ROUND(v_avaluo * (v_tarifa_pct / 100.0), 0);

        -- Evaluar Pronto Pago vs Mora según fecha de corte y límite
        IF p_fecha_corte <= v_param."fechaLimiteProntoPago" THEN
            v_descuento_pp := ROUND(v_valor_base * (v_param."porcentajeDescuentoProntoPago" / 100.0), 0);
            v_sancion_extemp := 0;
            v_intereses_mora := 0;
            v_total_pagar := v_valor_base - v_descuento_pp;
            v_estado := 'PENDIENTE';
            v_count_al_dia := v_count_al_dia + 1;
            v_total_descuentos_estimados := v_total_descuentos_estimados + v_descuento_pp;
        ELSE
            v_descuento_pp := 0;
            v_sancion_extemp := GREATEST(
                v_param."sancionMinimaMora",
                ROUND(v_valor_base * 0.05 * CEIL((p_fecha_corte - v_param."fechaLimiteProntoPago")::NUMERIC / 30.0), 0)
            );
            v_intereses_mora := fn_calcular_interes_mora(v_valor_base, v_param."fechaLimiteProntoPago", p_fecha_corte);
            v_total_pagar := v_valor_base + v_sancion_extemp + v_intereses_mora;
            v_estado := 'EN_MORA';
            v_count_en_mora := v_count_en_mora + 1;
            v_total_moras_liquidadas := v_total_moras_liquidadas + v_intereses_mora + v_sancion_extemp;
        END IF;

        v_total_recaudo_proyectado := v_total_recaudo_proyectado + v_total_pagar;

        -- Insertar o actualizar registro en la tabla ImpuestoVehicular
        INSERT INTO "ImpuestoVehicular" (
            id, "placaVehiculo", "vigenciaFiscal", "avaluoComercial",
            "valorBaseImpuesto", "sancionMora", "interesesMora",
            "descuentoProntoPago", "valorTotalPagar", estado,
            "fechaVencimiento", "createdAt", "updatedAt"
        ) VALUES (
            'imp-' || LOWER(v_vehiculo.placa) || '-' || p_vigencia,
            UPPER(v_vehiculo.placa),
            p_vigencia,
            v_avaluo,
            v_valor_base,
            v_sancion_extemp,
            v_intereses_mora,
            v_descuento_pp,
            v_total_pagar,
            v_estado::"EstadoImpuesto",
            v_param."fechaLimiteProntoPago",
            now(),
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            "avaluoComercial" = EXCLUDED."avaluoComercial",
            "valorBaseImpuesto" = EXCLUDED."valorBaseImpuesto",
            "sancionMora" = EXCLUDED."sancionMora",
            "interesesMora" = EXCLUDED."interesesMora",
            "descuentoProntoPago" = EXCLUDED."descuentoProntoPago",
            "valorTotalPagar" = EXCLUDED."valorTotalPagar",
            estado = CASE 
                WHEN "ImpuestoVehicular".estado = 'PAGADO' THEN 'PAGADO'::"EstadoImpuesto"
                WHEN "ImpuestoVehicular".estado = 'EN_ACUERDO_PAGO' THEN 'EN_ACUERDO_PAGO'::"EstadoImpuesto"
                ELSE EXCLUDED.estado 
            END,
            "updatedAt" = now();

        v_count_procesados := v_count_procesados + 1;
    END LOOP;

    v_duracion_ms := ROUND(EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::NUMERIC, 2);

    RETURN jsonb_build_object(
        'vigenciaFiscal', p_vigencia,
        'fechaCorte', p_fecha_corte,
        'fechaLimiteProntoPago', v_param."fechaLimiteProntoPago",
        'totalVehiculosLiquidados', v_count_procesados,
        'totalVehiculosAlDia', v_count_al_dia,
        'totalVehiculosEnMora', v_count_en_mora,
        'totalRecaudoProyectado', v_total_recaudo_proyectado,
        'totalDescuentosProntoPago', v_total_descuentos_estimados,
        'totalInteresesYSanciones', v_total_moras_liquidadas,
        'tiempoEjecucionMs', v_duracion_ms
    );
END;
$$ LANGUAGE plpgsql;
