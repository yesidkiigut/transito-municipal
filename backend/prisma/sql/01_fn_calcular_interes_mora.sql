-- ============================================================================
-- FUNCIÓN: fn_calcular_interes_mora
-- DESCRIPCIÓN: Calcula el interés de mora acumulado entre la fecha de exigibilidad/vencimiento
--              y la fecha de corte, consultando las tasas de interés certificadas por período.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calcular_interes_mora(
    p_capital NUMERIC,
    p_fecha_vencimiento DATE,
    p_fecha_corte DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_interes NUMERIC := 0;
    v_fecha_iter_inicio DATE;
    v_fecha_iter_fin DATE;
    v_anio INT;
    v_mes INT;
    v_dias_periodo INT;
    v_tasa_diaria NUMERIC;
    v_interes_periodo NUMERIC;
    v_ultimo_dia_mes DATE;
BEGIN
    -- Si no hay mora (corte antes o igual al vencimiento), el interés es 0
    IF p_fecha_corte <= p_fecha_vencimiento OR p_capital <= 0 THEN
        RETURN 0;
    END IF;

    -- El primer día de mora es el día siguiente al vencimiento
    v_fecha_iter_inicio := p_fecha_vencimiento + INTERVAL '1 day';

    -- Iterar mes por mes hasta la fecha de corte
    WHILE v_fecha_iter_inicio <= p_fecha_corte LOOP
        v_anio := EXTRACT(YEAR FROM v_fecha_iter_inicio);
        v_mes := EXTRACT(MONTH FROM v_fecha_iter_inicio);

        -- Obtener el último día del mes en curso
        v_ultimo_dia_mes := (DATE_TRUNC('month', v_fecha_iter_inicio) + INTERVAL '1 month - 1 day')::DATE;

        -- La fecha fin del subperíodo es el menor entre fin de mes y la fecha de corte
        IF v_ultimo_dia_mes < p_fecha_corte THEN
            v_fecha_iter_fin := v_ultimo_dia_mes;
        ELSE
            v_fecha_iter_fin := p_fecha_corte;
        END IF;

        -- Días de mora en este mes calendario (+1 para incluir ambos extremos)
        v_dias_periodo := (v_fecha_iter_fin - v_fecha_iter_inicio) + 1;

        -- Buscar tasa de mora registrada para este año y mes
        SELECT "tasaDiaria" INTO v_tasa_diaria
        FROM "TasaInteresMora"
        WHERE anio = v_anio AND mes = v_mes AND activo = true
        LIMIT 1;

        -- Si no hay tasa registrada para el período específico, buscar la más reciente disponible
        IF v_tasa_diaria IS NULL THEN
            SELECT "tasaDiaria" INTO v_tasa_diaria
            FROM "TasaInteresMora"
            WHERE activo = true
            ORDER BY anio DESC, mes DESC
            LIMIT 1;
        END IF;

        -- Fallback de seguridad (tasa mensual 2.1% => diaria 0.0007 aprox)
        IF v_tasa_diaria IS NULL THEN
            v_tasa_diaria := 0.0007;
        END IF;

        -- Interés simple del subperíodo: Capital * TasaDiaria * Días
        v_interes_periodo := p_capital * (v_tasa_diaria / 100.0) * v_dias_periodo;
        v_total_interes := v_total_interes + v_interes_periodo;

        -- Avanzar al primer día del siguiente mes
        v_fecha_iter_inicio := (v_ultimo_dia_mes + INTERVAL '1 day')::DATE;
    END LOOP;

    RETURN ROUND(v_total_interes, 0);
END;
$$ LANGUAGE plpgsql;
