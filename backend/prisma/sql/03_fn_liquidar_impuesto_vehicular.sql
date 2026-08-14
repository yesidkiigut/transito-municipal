-- ============================================================================
-- FUNCIÓN: fn_liquidar_impuesto_vehicular
-- DESCRIPCIÓN: Realiza la liquidación del impuesto sobre vehículos automotores
--              cruzando avalúo comercial, rangos en UVT, tarifas, pronto pago y sanciones.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_liquidar_impuesto_vehicular(
    p_placa TEXT,
    p_vigencia INT,
    p_fecha_corte DATE DEFAULT CURRENT_DATE,
    p_aplica_traslado BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_vehiculo RECORD;
    v_impuesto RECORD;
    v_param RECORD;
    v_avaluo NUMERIC;
    v_avaluo_uvt NUMERIC;
    v_tarifa_pct NUMERIC := 1.5;
    v_valor_base NUMERIC := 0;
    v_descuento_pronto_pago NUMERIC := 0;
    v_descuento_traslado NUMERIC := 0;
    v_total_descuentos NUMERIC := 0;
    v_sancion_extemporaneidad NUMERIC := 0;
    v_intereses_mora NUMERIC := 0;
    v_total_pagar NUMERIC := 0;
    v_fecha_vencimiento DATE;
    v_meses_mora INT := 0;
    v_estado_calculado TEXT := 'PENDIENTE';
BEGIN
    -- 1. Consultar vehículo
    SELECT v.id, v.placa, v.marca, v.linea, v.modelo, v.cilindraje, v."tipoVehiculo", v."claseServicio", v.estado
    INTO v_vehiculo
    FROM "Vehiculo" v
    WHERE UPPER(v.placa) = UPPER(p_placa)
    LIMIT 1;

    IF v_vehiculo IS NULL THEN
        RETURN jsonb_build_object('error', 'Vehículo con placa ' || UPPER(p_placa) || ' no encontrado');
    END IF;

    -- 2. Consultar parámetros fiscales anuales de la vigencia
    SELECT * INTO v_param
    FROM "ParametroAnual"
    WHERE "vigenciaFiscal" = p_vigencia AND activo = true
    LIMIT 1;

    IF v_param IS NULL THEN
        -- Valores fallback si no está parametrizada la vigencia
        v_param := ROW(
            gen_random_uuid(), p_vigencia, 49799.0, 1423500.0, 235000.0, 0.0, 10.0,
            (p_vigencia || '-05-31')::DATE, true, now(), now()
        )::"ParametroAnual";
    END IF;

    v_fecha_vencimiento := v_param."fechaLimiteProntoPago";

    -- 3. Obtener avalúo comercial del vehículo
    SELECT * INTO v_impuesto
    FROM "ImpuestoVehicular"
    WHERE UPPER("placaVehiculo") = UPPER(p_placa) AND "vigenciaFiscal" = p_vigencia
    LIMIT 1;

    IF v_impuesto IS NOT NULL THEN
        v_avaluo := v_impuesto."avaluoComercial";
    ELSE
        -- Estimación técnica de avalúo basada en modelo y cilindraje
        v_avaluo := (CASE WHEN v_vehiculo.modelo >= (p_vigencia - 4) THEN 65000000 ELSE 35000000 END)
                    + (v_vehiculo.cilindraje * 1200);
    END IF;

    -- 4. Determinar Tarifa según Rangos en UVT (Ley 488 de 1998)
    IF v_vehiculo."claseServicio" = 'PUBLICO' OR v_vehiculo."tipoVehiculo" = 'MOTOCICLETA' THEN
        -- Motocicletas >125cc y servicio público pagan tarifa plana de 1.5% o 0.5%
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

    -- 5. Calcular valor base del impuesto
    v_valor_base := ROUND(v_avaluo * (v_tarifa_pct / 100.0), 0);

    -- 6. Evaluar Pronto Pago vs Extemporaneidad e Intereses
    IF p_fecha_corte <= v_fecha_vencimiento THEN
        -- Beneficio de pronto pago
        v_descuento_pronto_pago := ROUND(v_valor_base * (v_param."porcentajeDescuentoProntoPago" / 100.0), 0);
        
        -- Beneficio de radicación / traslado de cuenta al municipio
        IF p_aplica_traslado THEN
            v_descuento_traslado := ROUND(v_valor_base * 0.50, 0);
        END IF;

        v_total_descuentos := v_descuento_pronto_pago + v_descuento_traslado;
        v_sancion_extemporaneidad := 0;
        v_intereses_mora := 0;
        v_estado_calculado := 'AL_DIA';
    ELSE
        -- Vencido: pierde descuentos y acumula sanción + mora
        v_total_descuentos := 0;
        v_descuento_pronto_pago := 0;
        v_descuento_traslado := 0;

        -- Sanción por extemporaneidad (5% por mes o fracción de mes calendario, mínimo sanción fija)
        v_meses_mora := CEIL((p_fecha_corte - v_fecha_vencimiento)::NUMERIC / 30.0);
        v_sancion_extemporaneidad := ROUND(v_valor_base * 0.05 * v_meses_mora, 0);
        
        IF v_sancion_extemporaneidad < v_param."sancionMinimaMora" THEN
            v_sancion_extemporaneidad := v_param."sancionMinimaMora";
        END IF;

        -- Intereses de mora acumulados
        v_intereses_mora := fn_calcular_interes_mora(v_valor_base, v_fecha_vencimiento, p_fecha_corte);
        v_estado_calculado := 'EN_MORA';
    END IF;

    v_total_pagar := GREATEST(0, (v_valor_base - v_total_descuentos) + v_sancion_extemporaneidad + v_intereses_mora);

    -- 7. Retornar resultado estructurado
    RETURN jsonb_build_object(
        'placa', UPPER(p_placa),
        'vigenciaFiscal', p_vigencia,
        'avaluoComercial', v_avaluo,
        'uvtVigencia', v_param."uvtValor",
        'avaluoEnUVT', ROUND(v_avaluo / v_param."uvtValor", 2),
        'tarifaPorcentaje', v_tarifa_pct,
        'valorBaseImpuesto', v_valor_base,
        'descuentoProntoPago', v_descuento_pronto_pago,
        'descuentoTraslado', v_descuento_traslado,
        'totalDescuentos', v_total_descuentos,
        'sancionExtemporaneidad', v_sancion_extemporaneidad,
        'interesesMora', v_intereses_mora,
        'valorTotalPagar', v_total_pagar,
        'fechaVencimiento', v_fecha_vencimiento,
        'fechaCorte', p_fecha_corte,
        'estadoLiquidacion', v_estado_calculado
    );
END;
$$ LANGUAGE plpgsql;
