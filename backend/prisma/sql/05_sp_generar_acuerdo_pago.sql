-- ============================================================================
-- FUNCIÓN TRANSACCIONAL: fn_crear_acuerdo_pago_transaccional
-- DESCRIPCIÓN: Registra formalmente un acuerdo de pago diferido en la base de datos,
--              generando sus cuotas de amortización y congelando los comparendos/impuestos.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_crear_acuerdo_pago_transaccional(
    p_ciudadano_id TEXT,
    p_placa TEXT,
    p_monto_total NUMERIC,
    p_porcentaje_inicial NUMERIC,
    p_numero_cuotas INT,
    p_tasa_interes NUMERIC DEFAULT 1.2,
    p_detalles_deuda JSONB DEFAULT '[]'::jsonb,
    p_funcionario_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_acuerdo_id TEXT;
    v_codigo_acuerdo TEXT;
    v_cuota_inicial NUMERIC;
    v_saldo_financiar NUMERIC;
    v_valor_cuota_fija NUMERIC := 0;
    v_fecha_primer_venc DATE;
    v_item RECORD;
    v_cuota RECORD;
    v_cuotas_generadas JSONB := '[]'::jsonb;
BEGIN
    -- 1. Generar identificadores
    v_acuerdo_id := gen_random_uuid()::TEXT;
    v_codigo_acuerdo := 'ACP-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    v_cuota_inicial := ROUND(p_monto_total * (p_porcentaje_inicial / 100.0), 0);
    v_saldo_financiar := p_monto_total - v_cuota_inicial;
    v_fecha_primer_venc := (CURRENT_DATE + INTERVAL '1 month')::DATE;

    -- 2. Insertar encabezado del Acuerdo de Pago
    INSERT INTO "AcuerdoPago" (
        id, "codigoAcuerdo", "ciudadanoId", "placaVehiculo",
        "montoTotalDeuda", "montoCuotaInicial", "saldoFinanciar",
        "numeroCuotas", "tasaInteresFinanciacion", "valorCuotaFija",
        estado, "fechaSuscripcion", "fechaPrimerVencimiento",
        "funcionarioRadicaId", "createdAt", "updatedAt"
    ) VALUES (
        v_acuerdo_id, v_codigo_acuerdo, p_ciudadano_id, UPPER(p_placa),
        p_monto_total, v_cuota_inicial, v_saldo_financiar,
        p_numero_cuotas, p_tasa_interes, 0,
        'ACTIVO', now(), v_fecha_primer_venc,
        p_funcionario_id, now(), now()
    );

    -- 3. Insertar detalles de la deuda asociada y actualizar estado de obligaciones
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_detalles_deuda) AS x(
        "tipoConcepto" TEXT,
        "referenciaConcepto" TEXT,
        "montoCapital" NUMERIC,
        "montoIntereses" NUMERIC,
        "montoTotal" NUMERIC
    ) LOOP
        INSERT INTO "DetalleDeudaAcuerdo" (
            id, "acuerdoId", "tipoConcepto", "referenciaConcepto",
            "montoCapital", "montoIntereses", "montoTotal", "createdAt"
        ) VALUES (
            gen_random_uuid()::TEXT, v_acuerdo_id, v_item."tipoConcepto"::"TipoConceptoPago", v_item."referenciaConcepto",
            v_item."montoCapital", v_item."montoIntereses", v_item."montoTotal", now()
        );

        -- Congelar comparendo si aplica
        IF v_item."tipoConcepto" = 'COMPARENDO' THEN
            UPDATE "Comparendo"
            SET estado = 'EN_ACUERDO_PAGO', "updatedAt" = now()
            WHERE id = v_item."referenciaConcepto" OR "numeroComparendo" = v_item."referenciaConcepto";
        END IF;

        -- Congelar impuesto si aplica
        IF v_item."tipoConcepto" = 'IMPUESTO_VEHICULAR' THEN
            UPDATE "ImpuestoVehicular"
            SET estado = 'EN_ACUERDO_PAGO', "updatedAt" = now()
            WHERE id = v_item."referenciaConcepto";
        END IF;
    END LOOP;

    -- 4. Generar e insertar las cuotas usando la función de simulación
    FOR v_cuota IN 
        SELECT * FROM fn_simular_acuerdo_pago(p_monto_total, p_porcentaje_inicial, p_numero_cuotas, p_tasa_interes, CURRENT_DATE)
    LOOP
        INSERT INTO "CuotaAcuerdoPago" (
            id, "acuerdoId", "numeroCuota", "valorCapital", "valorInteres",
            "valorTotalCuota", "saldoRestante", "fechaVencimiento",
            estado, "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::TEXT, v_acuerdo_id, v_cuota.numero_cuota,
            v_cuota.valor_capital, v_cuota.valor_interes, v_cuota.valor_total_cuota,
            v_cuota.saldo_restante, v_cuota.fecha_vencimiento,
            'PENDIENTE', now(), now()
        );

        IF v_cuota.numero_cuota = 1 THEN
            v_valor_cuota_fija := v_cuota.valor_total_cuota;
        END IF;

        v_cuotas_generadas := v_cuotas_generadas || jsonb_build_object(
            'numeroCuota', v_cuota.numero_cuota,
            'fechaVencimiento', v_cuota.fecha_vencimiento,
            'valorCapital', v_cuota.valor_capital,
            'valorInteres', v_cuota.valor_interes,
            'valorTotalCuota', v_cuota.valor_total_cuota,
            'saldoRestante', v_cuota.saldo_restante
        );
    END LOOP;

    -- Actualizar cuota fija estimada en el encabezado
    UPDATE "AcuerdoPago"
    SET "valorCuotaFija" = v_valor_cuota_fija
    WHERE id = v_acuerdo_id;

    RETURN jsonb_build_object(
        'acuerdoId', v_acuerdo_id,
        'codigoAcuerdo', v_codigo_acuerdo,
        'ciudadanoId', p_ciudadano_id,
        'placaVehiculo', p_placa,
        'montoTotalDeuda', p_monto_total,
        'montoCuotaInicial', v_cuota_inicial,
        'saldoFinanciar', v_saldo_financiar,
        'numeroCuotas', p_numero_cuotas,
        'valorCuotaFija', v_valor_cuota_fija,
        'estado', 'ACTIVO',
        'cuotas', v_cuotas_generadas
    );
END;
$$ LANGUAGE plpgsql;
