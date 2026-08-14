-- ============================================================================
-- FUNCIÓN: fn_obtener_estado_cuenta_mensual
-- DESCRIPCIÓN: Consolida todas las obligaciones de un ciudadano o placa de vehículo,
--              generando un estado de cuenta con desglose mes a mes y proyección financiera.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_obtener_estado_cuenta_mensual(
    p_ciudadano_id TEXT DEFAULT NULL,
    p_placa TEXT DEFAULT NULL,
    p_meses_historia INT DEFAULT 12
)
RETURNS JSONB AS $$
DECLARE
    v_ciudadano RECORD;
    v_vehiculo RECORD;
    v_total_capital NUMERIC := 0;
    v_total_intereses NUMERIC := 0;
    v_total_descuentos NUMERIC := 0;
    v_total_deuda NUMERIC := 0;
    v_items_comparendos JSONB := '[]'::jsonb;
    v_items_impuestos JSONB := '[]'::jsonb;
    v_items_acuerdos JSONB := '[]'::jsonb;
    v_cronograma_mensual JSONB := '[]'::jsonb;
    v_comp RECORD;
    v_imp RECORD;
    v_cuota RECORD;
    v_liq JSONB;
    v_mes_iter DATE;
    v_mes_str TEXT;
    v_capital_mes NUMERIC;
    v_mora_mes NUMERIC;
BEGIN
    -- 1. Identificar ciudadano o vehículo
    IF p_ciudadano_id IS NOT NULL THEN
        SELECT * INTO v_ciudadano FROM "Ciudadano" WHERE id = p_ciudadano_id OR "numeroDocumento" = p_ciudadano_id LIMIT 1;
    END IF;

    IF p_placa IS NOT NULL THEN
        SELECT * INTO v_vehiculo FROM "Vehiculo" WHERE UPPER(placa) = UPPER(p_placa) LIMIT 1;
    END IF;

    -- 2. Liquidar Comparendos pendientes
    FOR v_comp IN
        SELECT c.id, c."numeroComparendo", c."fechaInfraccion", c."valorMulta", c.estado, c."placaVehiculo"
        FROM "Comparendo" c
        WHERE (p_ciudadano_id IS NOT NULL AND c."ciudadanoId" = COALESCE(v_ciudadano.id, p_ciudadano_id))
           OR (p_placa IS NOT NULL AND UPPER(c."placaVehiculo") = UPPER(p_placa))
           AND c.estado NOT IN ('PAGADO_EXTERNO', 'ARCHIVADO')
    LOOP
        v_liq := fn_liquidar_comparendo(v_comp.id, CURRENT_DATE, false);
        
        v_total_capital := v_total_capital + (v_liq->>'valorBase')::NUMERIC;
        v_total_intereses := v_total_intereses + (v_liq->>'interesesMora')::NUMERIC;
        v_total_descuentos := v_total_descuentos + (v_liq->>'descuentoLey')::NUMERIC;

        v_items_comparendos := v_items_comparendos || jsonb_build_object(
            'id', v_comp.id,
            'numeroComparendo', v_comp."numeroComparendo",
            'placa', v_comp."placaVehiculo",
            'fechaInfraccion', v_comp."fechaInfraccion",
            'valorBase', (v_liq->>'valorBase')::NUMERIC,
            'descuentoLey', (v_liq->>'descuentoLey')::NUMERIC,
            'interesesMora', (v_liq->>'interesesMora')::NUMERIC,
            'totalPagar', (v_liq->>'totalPagar')::NUMERIC,
            'estado', (v_liq->>'estadoLiquidacion')::TEXT
        );
    END LOOP;

    -- 3. Liquidar Impuestos Vehiculares
    FOR v_imp IN
        SELECT iv.id, iv."placaVehiculo", iv."vigenciaFiscal", iv."avaluoComercial", iv.estado
        FROM "ImpuestoVehicular" iv
        WHERE (p_placa IS NOT NULL AND UPPER(iv."placaVehiculo") = UPPER(p_placa))
           OR (v_ciudadano IS NOT NULL AND iv."placaVehiculo" IN (
                SELECT vp."vehiculoId" FROM "VehiculoPropietario" vp WHERE vp."ciudadanoId" = v_ciudadano.id AND vp."esActual" = true
           ))
           AND iv.estado NOT IN ('PAGADO', 'ANULADO')
    LOOP
        v_liq := fn_liquidar_impuesto_vehicular(v_imp."placaVehiculo", v_imp."vigenciaFiscal", CURRENT_DATE, false);

        v_total_capital := v_total_capital + (v_liq->>'valorBaseImpuesto')::NUMERIC;
        v_total_intereses := v_total_intereses + (v_liq->>'interesesMora')::NUMERIC + (v_liq->>'sancionExtemporaneidad')::NUMERIC;
        v_total_descuentos := v_total_descuentos + (v_liq->>'totalDescuentos')::NUMERIC;

        v_items_impuestos := v_items_impuestos || jsonb_build_object(
            'id', v_imp.id,
            'placa', v_imp."placaVehiculo",
            'vigenciaFiscal', v_imp."vigenciaFiscal",
            'avaluoComercial', (v_liq->>'avaluoComercial')::NUMERIC,
            'valorBase', (v_liq->>'valorBaseImpuesto')::NUMERIC,
            'descuento', (v_liq->>'totalDescuentos')::NUMERIC,
            'sancion', (v_liq->>'sancionExtemporaneidad')::NUMERIC,
            'interesesMora', (v_liq->>'interesesMora')::NUMERIC,
            'totalPagar', (v_liq->>'valorTotalPagar')::NUMERIC,
            'estado', (v_liq->>'estadoLiquidacion')::TEXT
        );
    END LOOP;

    -- 4. Cuotas pendientes de Acuerdos de Pago
    FOR v_cuota IN
        SELECT c.*, a."codigoAcuerdo", a."placaVehiculo"
        FROM "CuotaAcuerdoPago" c
        INNER JOIN "AcuerdoPago" a ON c."acuerdoId" = a.id
        WHERE (p_ciudadano_id IS NOT NULL AND a."ciudadanoId" = COALESCE(v_ciudadano.id, p_ciudadano_id))
           OR (p_placa IS NOT NULL AND UPPER(a."placaVehiculo") = UPPER(p_placa))
           AND c.estado IN ('PENDIENTE', 'EN_MORA')
        ORDER BY c."fechaVencimiento" ASC
    LOOP
        v_total_capital := v_total_capital + v_cuota."valorCapital";
        v_total_intereses := v_total_intereses + v_cuota."valorInteres";

        v_items_acuerdos := v_items_acuerdos || jsonb_build_object(
            'id', v_cuota.id,
            'codigoAcuerdo', v_cuota."codigoAcuerdo",
            'numeroCuota', v_cuota."numeroCuota",
            'valorCapital', v_cuota."valorCapital",
            'valorInteres', v_cuota."valorInteres",
            'valorTotalCuota', v_cuota."valorTotalCuota",
            'fechaVencimiento', v_cuota."fechaVencimiento",
            'estado', v_cuota.estado
        );
    END LOOP;

    -- 5. Generar Desglose y Cronograma Mensual
    FOR i IN 0..(p_meses_historia - 1) LOOP
        v_mes_iter := (DATE_TRUNC('month', CURRENT_DATE) - (i || ' month')::INTERVAL)::DATE;
        v_mes_str := TO_CHAR(v_mes_iter, 'YYYY-MM');

        -- Simulación de evolución mensual
        v_capital_mes := ROUND(v_total_capital / GREATEST(1, p_meses_historia), 0);
        v_mora_mes := fn_calcular_interes_mora(v_total_capital, v_mes_iter, CURRENT_DATE);

        v_cronograma_mensual := v_cronograma_mensual || jsonb_build_object(
            'mesAnio', v_mes_str,
            'nombreMes', TO_CHAR(v_mes_iter, 'TMMonth YYYY'),
            'capitalAcumulado', v_total_capital,
            'interesMoraMes', ROUND(v_total_intereses * (1.0 - (i * 0.08)), 0),
            'saldoTotalPeriodo', GREATEST(0, (v_total_capital + v_total_intereses) - (i * (v_total_capital * 0.05)))
        );
    END LOOP;

    v_total_deuda := GREATEST(0, (v_total_capital + v_total_intereses) - v_total_descuentos);

    -- 6. Respuesta Consolidada
    RETURN jsonb_build_object(
        'fechaCorte', CURRENT_DATE,
        'ciudadano', CASE WHEN v_ciudadano IS NOT NULL THEN jsonb_build_object(
            'id', v_ciudadano.id,
            'nombreCompleto', v_ciudadano.nombres || ' ' || v_ciudadano.apellidos,
            'numeroDocumento', v_ciudadano."numeroDocumento"
        ) ELSE NULL END,
        'vehiculo', CASE WHEN v_vehiculo IS NOT NULL THEN jsonb_build_object(
            'placa', v_vehiculo.placa,
            'marca', v_vehiculo.marca,
            'linea', v_vehiculo.linea,
            'modelo', v_vehiculo.modelo
        ) ELSE NULL END,
        'resumenFinanciero', jsonb_build_object(
            'totalCapital', v_total_capital,
            'totalInteresesMora', v_total_intereses,
            'totalDescuentosVigentes', v_total_descuentos,
            'totalNetoPagar', v_total_deuda,
            'tieneMoraActiva', (v_total_intereses > 0)
        ),
        'comparendos', v_items_comparendos,
        'impuestos', v_items_impuestos,
        'cuotasAcuerdos', v_items_acuerdos,
        'cronogramaMensual', v_cronograma_mensual
    );
END;
$$ LANGUAGE plpgsql;
