-- ============================================================================
-- FUNCIÓN: fn_simular_acuerdo_pago
-- DESCRIPCIÓN: Genera la tabla de amortización y cronograma proyectado de un acuerdo
--              de pago diferido en N cuotas mensuales.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_simular_acuerdo_pago(
    p_monto_total NUMERIC,
    p_porcentaje_inicial NUMERIC DEFAULT 20.0,
    p_numero_cuotas INT DEFAULT 6,
    p_tasa_interes_mensual NUMERIC DEFAULT 1.2,
    p_fecha_inicio DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    numero_cuota INT,
    fecha_vencimiento DATE,
    valor_capital NUMERIC,
    valor_interes NUMERIC,
    valor_total_cuota NUMERIC,
    saldo_restante NUMERIC
) AS $$
DECLARE
    v_cuota_inicial NUMERIC;
    v_saldo_financiar NUMERIC;
    v_saldo_actual NUMERIC;
    v_i NUMERIC;
    v_cuota_fija NUMERIC;
    v_interes_mes NUMERIC;
    v_capital_mes NUMERIC;
    v_idx INT;
    v_fecha_cuota DATE;
BEGIN
    -- Validaciones básicas
    IF p_monto_total <= 0 OR p_numero_cuotas < 1 THEN
        RETURN;
    END IF;

    -- 1. Calcular Cuota Inicial (Cuota 0)
    v_cuota_inicial := ROUND(p_monto_total * (GREATEST(0, LEAST(100, p_porcentaje_inicial)) / 100.0), 0);
    v_saldo_financiar := p_monto_total - v_cuota_inicial;
    v_saldo_actual := v_saldo_financiar;

    -- Emitir fila de la Cuota Inicial
    numero_cuota := 0;
    fecha_vencimiento := p_fecha_inicio;
    valor_capital := v_cuota_inicial;
    valor_interes := 0;
    valor_total_cuota := v_cuota_inicial;
    saldo_restante := v_saldo_financiar;
    RETURN NEXT;

    -- Si el saldo a financiar es 0 (pagó 100% inicial), terminar
    IF v_saldo_financiar <= 0 THEN
        RETURN;
    END IF;

    -- 2. Calcular cuota fija mensual (Fórmula de Anualidad / Sistema Francés)
    v_i := p_tasa_interes_mensual / 100.0;

    IF v_i > 0 THEN
        -- Cuota = Saldo * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
        v_cuota_fija := ROUND(v_saldo_financiar * (v_i * POWER(1 + v_i, p_numero_cuotas)) / (POWER(1 + v_i, p_numero_cuotas) - 1), 0);
    ELSE
        v_cuota_fija := ROUND(v_saldo_financiar / p_numero_cuotas, 0);
    END IF;

    -- 3. Generar cronograma de cuotas 1 a N
    FOR v_idx IN 1..p_numero_cuotas LOOP
        v_fecha_cuota := (p_fecha_inicio + (v_idx || ' month')::INTERVAL)::DATE;
        
        -- Interés del mes sobre el saldo insoluto
        v_interes_mes := ROUND(v_saldo_actual * v_i, 0);

        -- En la última cuota, ajustar para amortizar exactamente el saldo remanente
        IF v_idx = p_numero_cuotas THEN
            v_capital_mes := v_saldo_actual;
            v_cuota_fija := v_capital_mes + v_interes_mes;
            v_saldo_actual := 0;
        ELSE
            v_capital_mes := v_cuota_fija - v_interes_mes;
            IF v_capital_mes > v_saldo_actual THEN
                v_capital_mes := v_saldo_actual;
            END IF;
            v_saldo_actual := v_saldo_actual - v_capital_mes;
        END IF;

        numero_cuota := v_idx;
        fecha_vencimiento := v_fecha_cuota;
        valor_capital := v_capital_mes;
        valor_interes := v_interes_mes;
        valor_total_cuota := v_cuota_fija;
        saldo_restante := v_saldo_actual;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
