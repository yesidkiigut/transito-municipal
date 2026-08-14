-- ============================================================================
-- FUNCIÓN: fn_calcular_tramos_descuento
-- DESCRIPCIÓN: Calcula la matriz completa de tramos de descuento, fechas límites,
--              días hábiles restantes y ahorro económico para comparendos o impuestos.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calcular_tramos_descuento(
    p_tipo_concepto TEXT, -- 'COMPARENDO' o 'IMPUESTO_VEHICULAR'
    p_referencia_id TEXT,
    p_fecha_corte DATE DEFAULT CURRENT_DATE,
    p_realizo_curso BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_comp RECORD;
    v_imp RECORD;
    v_param RECORD;
    v_fecha_inicio DATE;
    v_valor_base NUMERIC := 0;
    v_dias_habiles_transcurridos INT := 0;
    v_dias_calendario_transcurridos INT := 0;
    v_iter_fecha DATE;
    v_regla RECORD;
    v_tramos JSONB := '[]'::jsonb;
    v_tramo_actual JSONB := NULL;
    v_tramo_idx INT := 0;
    v_es_actual BOOLEAN := false;
    v_fecha_limite_tramo DATE;
    v_dias_habiles_restantes INT;
    v_dias_cal_restantes INT;
    v_monto_descuento NUMERIC;
    v_total_tramo NUMERIC;
    v_intereses_mora NUMERIC := 0;
    v_sancion_extemp NUMERIC := 0;
    v_ahorro_maximo NUMERIC := 0;
    v_placa TEXT := '';
BEGIN
    -- ========================================================================
    -- CASO 1: COMPARENDOS DE TRÁNSITO
    -- ========================================================================
    IF UPPER(p_tipo_concepto) = 'COMPARENDO' THEN
        SELECT c.id, c."numeroComparendo", c."fechaInfraccion", c."valorMulta", c.estado, c."placaVehiculo",
               ti.codigo as codigo_infraccion, ti.descripcion as infraccion_desc
        INTO v_comp
        FROM "Comparendo" c
        INNER JOIN "TipoInfraccion" ti ON c."tipoInfraccionId" = ti.id
        WHERE c.id = p_referencia_id OR c."numeroComparendo" = p_referencia_id
        LIMIT 1;

        IF v_comp IS NULL THEN
            RETURN jsonb_build_object('error', 'Comparendo no encontrado');
        END IF;

        v_fecha_inicio := v_comp."fechaInfraccion"::DATE;
        v_valor_base := v_comp."valorMulta";
        v_placa := v_comp."placaVehiculo";

        -- Calcular días hábiles y calendario transcurridos
        v_iter_fecha := v_fecha_inicio + INTERVAL '1 day';
        WHILE v_iter_fecha <= p_fecha_corte LOOP
            IF EXTRACT(ISODOW FROM v_iter_fecha) < 6 THEN
                v_dias_habiles_transcurridos := v_dias_habiles_transcurridos + 1;
            END IF;
            v_iter_fecha := (v_iter_fecha + INTERVAL '1 day')::DATE;
        END LOOP;
        v_dias_calendario_transcurridos := GREATEST(0, (p_fecha_corte - v_fecha_inicio));

        -- Iterar sobre todas las reglas de descuento activas en la base de datos
        FOR v_regla IN
            SELECT * FROM "ReglaDescuentoLey"
            WHERE activo = true
            ORDER BY "porcentajeDescuento" DESC, "diasHabilesMin" ASC
        LOOP
            v_tramo_idx := v_tramo_idx + 1;

            -- Calcular fecha límite sumando los días hábiles máximos de la regla
            v_iter_fecha := v_fecha_inicio;
            DECLARE
                v_h_count INT := 0;
            BEGIN
                WHILE v_h_count < v_regla."diasHabilesMax" LOOP
                    v_iter_fecha := (v_iter_fecha + INTERVAL '1 day')::DATE;
                    IF EXTRACT(ISODOW FROM v_iter_fecha) < 6 THEN
                        v_h_count := v_h_count + 1;
                    END IF;
                END LOOP;
                v_fecha_limite_tramo := v_iter_fecha;
            END;

            -- Calcular días hábiles restantes hasta la fecha límite
            v_dias_habiles_restantes := 0;
            IF p_fecha_corte <= v_fecha_limite_tramo THEN
                v_iter_fecha := p_fecha_corte + INTERVAL '1 day';
                WHILE v_iter_fecha <= v_fecha_limite_tramo LOOP
                    IF EXTRACT(ISODOW FROM v_iter_fecha) < 6 THEN
                        v_dias_habiles_restantes := v_dias_habiles_restantes + 1;
                    END IF;
                    v_iter_fecha := (v_iter_fecha + INTERVAL '1 day')::DATE;
                END LOOP;
            END IF;
            v_dias_cal_restantes := GREATEST(0, (v_fecha_limite_tramo - p_fecha_corte));

            -- Evaluar si este tramo es el actualmente vigente
            v_es_actual := (v_dias_habiles_transcurridos BETWEEN v_regla."diasHabilesMin" AND v_regla."diasHabilesMax")
                           AND (v_tramo_actual IS NULL);

            v_monto_descuento := ROUND(v_valor_base * (v_regla."porcentajeDescuento" / 100.0), 0);
            v_total_tramo := v_valor_base - v_monto_descuento;

            IF v_monto_descuento > v_ahorro_maximo THEN
                v_ahorro_maximo := v_monto_descuento;
            END IF;

            DECLARE
                v_tramo_obj JSONB;
            BEGIN
                v_tramo_obj := jsonb_build_object(
                    'numeroTramo', v_tramo_idx,
                    'codigoRegla', v_regla.codigo,
                    'nombre', v_regla.descripcion,
                    'porcentajeDescuento', v_regla."porcentajeDescuento",
                    'requiereCurso', v_regla."requiereCurso",
                    'valorBase', v_valor_base,
                    'montoDescuento', v_monto_descuento,
                    'totalPagar', v_total_tramo,
                    'fechaInicio', v_fecha_inicio,
                    'fechaLimite', v_fecha_limite_tramo,
                    'diasHabilesRestantes', v_dias_habiles_restantes,
                    'diasCalendarioRestantes', v_dias_cal_restantes,
                    'esTramoActual', v_es_actual,
                    'estado', CASE 
                        WHEN p_fecha_corte > v_fecha_limite_tramo THEN 'EXPIRADO'
                        WHEN v_es_actual THEN 'VIGENTE_ACTIVO'
                        ELSE 'PROXIMO'
                    END
                );

                v_tramos := v_tramos || v_tramo_obj;

                IF v_es_actual THEN
                    v_tramo_actual := v_tramo_obj;
                END IF;
            END;
        END LOOP;

        -- Si ya vencieron todos los tramos de descuento, añadir tramo de Mora
        IF v_dias_habiles_transcurridos > 20 OR p_fecha_corte > (v_fecha_inicio + INTERVAL '30 days') THEN
            v_intereses_mora := fn_calcular_interes_mora(v_valor_base, (v_fecha_inicio + INTERVAL '30 days')::DATE, p_fecha_corte);
            v_tramo_idx := v_tramo_idx + 1;

            DECLARE
                v_tramo_mora JSONB;
            BEGIN
                v_tramo_mora := jsonb_build_object(
                    'numeroTramo', v_tramo_idx,
                    'codigoRegla', 'PERIODO_MORA',
                    'nombre', 'Cobro con Intereses Moratorios Acumulados',
                    'porcentajeDescuento', 0,
                    'requiereCurso', false,
                    'valorBase', v_valor_base,
                    'montoDescuento', 0,
                    'interesesMora', v_intereses_mora,
                    'totalPagar', v_valor_base + v_intereses_mora,
                    'fechaInicio', (v_fecha_inicio + INTERVAL '31 days')::DATE,
                    'fechaLimite', NULL,
                    'diasHabilesRestantes', 0,
                    'diasCalendarioRestantes', 0,
                    'esTramoActual', true,
                    'estado', 'EN_MORA'
                );
                v_tramos := v_tramos || v_tramo_mora;
                v_tramo_actual := v_tramo_mora;
            END;
        END IF;

    -- ========================================================================
    -- CASO 2: IMPUESTO VEHICULAR
    -- ========================================================================
    ELSE
        SELECT iv.*, v.marca, v.linea, v.modelo
        INTO v_imp
        FROM "ImpuestoVehicular" iv
        INNER JOIN "Vehiculo" v ON UPPER(iv."placaVehiculo") = UPPER(v.placa)
        WHERE (iv.id = p_referencia_id OR UPPER(iv."placaVehiculo") = UPPER(p_referencia_id))
        ORDER BY iv."vigenciaFiscal" DESC
        LIMIT 1;

        IF v_imp IS NULL THEN
            RETURN jsonb_build_object('error', 'Obligación de impuesto vehicular no encontrada');
        END IF;

        SELECT * INTO v_param
        FROM "ParametroAnual"
        WHERE "vigenciaFiscal" = v_imp."vigenciaFiscal" AND activo = true
        LIMIT 1;

        v_fecha_inicio := (v_imp."vigenciaFiscal" || '-01-01')::DATE;
        v_valor_base := v_imp."valorBaseImpuesto";
        v_placa := v_imp."placaVehiculo";

        -- Tramo 1: Pronto Pago (10% de descuento antes de la fecha límite)
        v_fecha_limite_tramo := COALESCE(v_param."fechaLimiteProntoPago", (v_imp."vigenciaFiscal" || '-05-31')::DATE);
        v_dias_cal_restantes := GREATEST(0, (v_fecha_limite_tramo - p_fecha_corte));
        v_monto_descuento := ROUND(v_valor_base * (COALESCE(v_param."porcentajeDescuentoProntoPago", 10.0) / 100.0), 0);
        v_es_actual := (p_fecha_corte <= v_fecha_limite_tramo);
        v_ahorro_maximo := v_monto_descuento;

        v_tramos := v_tramos || jsonb_build_object(
            'numeroTramo', 1,
            'codigoRegla', 'PRONTO_PAGO_IMPUESTO',
            'nombre', 'Descuento de Pronto Pago Anual (' || COALESCE(v_param."porcentajeDescuentoProntoPago", 10.0) || '%)',
            'porcentajeDescuento', COALESCE(v_param."porcentajeDescuentoProntoPago", 10.0),
            'requiereCurso', false,
            'valorBase', v_valor_base,
            'montoDescuento', v_monto_descuento,
            'totalPagar', v_valor_base - v_monto_descuento,
            'fechaInicio', v_fecha_inicio,
            'fechaLimite', v_fecha_limite_tramo,
            'diasHabilesRestantes', v_dias_cal_restantes,
            'diasCalendarioRestantes', v_dias_cal_restantes,
            'esTramoActual', v_es_actual,
            'estado', CASE WHEN v_es_actual THEN 'VIGENTE_ACTIVO' ELSE 'EXPIRADO' END
        );

        -- Tramo 2: Extemporaneidad / Mora
        IF p_fecha_corte > v_fecha_limite_tramo THEN
            v_intereses_mora := fn_calcular_interes_mora(v_valor_base, v_fecha_limite_tramo, p_fecha_corte);
            v_sancion_extemp := GREATEST(
                COALESCE(v_param."sancionMinimaMora", 249000),
                ROUND(v_valor_base * 0.05 * CEIL((p_fecha_corte - v_fecha_limite_tramo)::NUMERIC / 30.0), 0)
            );

            v_tramos := v_tramos || jsonb_build_object(
                'numeroTramo', 2,
                'codigoRegla', 'EXTEMPORANEIDAD_MORA',
                'nombre', 'Cobro con Sanción de Extemporaneidad e Intereses',
                'porcentajeDescuento', 0,
                'requiereCurso', false,
                'valorBase', v_valor_base,
                'montoDescuento', 0,
                'sancionExtemporaneidad', v_sancion_extemp,
                'interesesMora', v_intereses_mora,
                'totalPagar', v_valor_base + v_sancion_extemp + v_intereses_mora,
                'fechaInicio', (v_fecha_limite_tramo + INTERVAL '1 day')::DATE,
                'fechaLimite', NULL,
                'diasHabilesRestantes', 0,
                'diasCalendarioRestantes', 0,
                'esTramoActual', true,
                'estado', 'EN_MORA'
            );
        END IF;
    END IF;

    -- Si ningún tramo fue marcado como actual, asignar el primero disponible o de mora
    IF v_tramo_actual IS NULL AND jsonb_array_length(v_tramos) > 0 THEN
        v_tramo_actual := v_tramos->(jsonb_array_length(v_tramos) - 1);
    END IF;

    -- Retornar Respuesta Consolidada
    RETURN jsonb_build_object(
        'tipoConcepto', UPPER(p_tipo_concepto),
        'referenciaId', p_referencia_id,
        'placa', v_placa,
        'fechaCorte', p_fecha_corte,
        'valorBase', v_valor_base,
        'ahorroMaximoPosible', v_ahorro_maximo,
        'realizoCursoPedagogico', p_realizo_curso,
        'diasHabilesTranscurridos', v_dias_habiles_transcurridos,
        'diasCalendarioTranscurridos', v_dias_calendario_transcurridos,
        'tramoVigenteActual', v_tramo_actual,
        'tramosDisponibles', v_tramos
    );
END;
$$ LANGUAGE plpgsql;
