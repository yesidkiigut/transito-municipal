-- ============================================================================
-- FUNCIÓN: fn_liquidar_comparendo
-- DESCRIPCIÓN: Realiza la liquidación normativa automática de un comparendo de tránsito
--              calculando beneficios de ley (descuentos) o intereses moratorios acumulados.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_liquidar_comparendo(
    p_comparendo_id TEXT,
    p_fecha_corte DATE DEFAULT CURRENT_DATE,
    p_realizo_curso BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_comp RECORD;
    v_fecha_infraccion DATE;
    v_dias_habiles INT := 0;
    v_dias_calendario INT := 0;
    v_porcentaje_descuento NUMERIC := 0;
    v_descuento_aplicado NUMERIC := 0;
    v_intereses_mora NUMERIC := 0;
    v_subtotal NUMERIC := 0;
    v_total_pagar NUMERIC := 0;
    v_estado_calculado TEXT := 'PENDIENTE';
    v_regla RECORD;
    v_fecha_vencimiento_plena DATE;
    v_iter_fecha DATE;
BEGIN
    -- 1. Obtener datos del comparendo
    SELECT c.id, c."numeroComparendo", c."fechaInfraccion", c."valorMulta", c.estado,
           ti.codigo as codigo_infraccion, ti.descripcion as infraccion_desc, ti."valorBase"
    INTO v_comp
    FROM "Comparendo" c
    INNER JOIN "TipoInfraccion" ti ON c."tipoInfraccionId" = ti.id
    WHERE c.id = p_comparendo_id OR c."numeroComparendo" = p_comparendo_id
    LIMIT 1;

    IF v_comp IS NULL THEN
        RETURN jsonb_build_object('error', 'Comparendo no encontrado');
    END IF;

    -- Si ya fue pagado o archivado
    IF v_comp.estado IN ('PAGADO_EXTERNO', 'ARCHIVADO') THEN
        RETURN jsonb_build_object(
            'comparendoId', v_comp.id,
            'numeroComparendo', v_comp."numeroComparendo",
            'estado', v_comp.estado,
            'valorBase', v_comp."valorMulta",
            'descuentoLey', 0,
            'interesesMora', 0,
            'totalPagar', 0,
            'mensaje', 'El comparendo se encuentra en estado ' || v_comp.estado
        );
    END IF;

    v_fecha_infraccion := v_comp."fechaInfraccion"::DATE;
    v_dias_calendario := (p_fecha_corte - v_fecha_infraccion);
    IF v_dias_calendario < 0 THEN
        v_dias_calendario := 0;
    END IF;

    -- 2. Calcular días hábiles transcurridos (excluyendo sábados y domingos)
    v_iter_fecha := v_fecha_infraccion + INTERVAL '1 day';
    WHILE v_iter_fecha <= p_fecha_corte LOOP
        -- EXTRACT(ISODOW): 6 = Sábado, 7 = Domingo
        IF EXTRACT(ISODOW FROM v_iter_fecha) < 6 THEN
            v_dias_habiles := v_dias_habiles + 1;
        END IF;
        v_iter_fecha := (v_iter_fecha + INTERVAL '1 day')::DATE;
    END LOOP;

    -- 3. Buscar regla de descuento aplicable según días hábiles y curso pedagógico
    SELECT * INTO v_regla
    FROM "ReglaDescuentoLey"
    WHERE activo = true
      AND v_dias_habiles BETWEEN "diasHabilesMin" AND "diasHabilesMax"
      AND (NOT "requiereCurso" OR ("requiereCurso" AND p_realizo_curso))
    ORDER BY "porcentajeDescuento" DESC
    LIMIT 1;

    IF v_regla IS NOT NULL THEN
        v_porcentaje_descuento := v_regla."porcentajeDescuento";
    ELSE
        -- Si no hizo curso en los primeros 5 días pero está dentro de 5 días hábiles, descuento es 0 o parcial
        v_porcentaje_descuento := 0;
    END IF;

    v_descuento_aplicado := ROUND(v_comp."valorMulta" * (v_porcentaje_descuento / 100.0), 0);
    v_subtotal := v_comp."valorMulta" - v_descuento_aplicado;

    -- 4. Fecha límite de pago sin mora: 30 días calendario tras la infracción / resolución
    v_fecha_vencimiento_plena := v_fecha_infraccion + INTERVAL '30 days';

    IF p_fecha_corte > v_fecha_vencimiento_plena THEN
        -- Se anulan los descuentos si entró en mora
        v_descuento_aplicado := 0;
        v_porcentaje_descuento := 0;
        v_subtotal := v_comp."valorMulta";

        -- Calcular intereses moratorios
        v_intereses_mora := fn_calcular_interes_mora(v_comp."valorMulta", v_fecha_vencimiento_plena, p_fecha_corte);
        v_estado_calculado := 'EN_MORA';
    ELSE
        v_intereses_mora := 0;
        v_estado_calculado := CASE WHEN v_comp.estado = 'EN_ACUERDO_PAGO' THEN 'EN_ACUERDO_PAGO' ELSE 'VIGENTE' END;
    END IF;

    v_total_pagar := v_subtotal + v_intereses_mora;

    -- 5. Construir respuesta JSONB
    RETURN jsonb_build_object(
        'comparendoId', v_comp.id,
        'numeroComparendo', v_comp."numeroComparendo",
        'codigoInfraccion', v_comp.codigo_infraccion,
        'descripcionInfraccion', v_comp.infraccion_desc,
        'fechaInfraccion', v_fecha_infraccion,
        'fechaCorte', p_fecha_corte,
        'diasHabiles', v_dias_habiles,
        'diasCalendario', v_dias_calendario,
        'realizoCurso', p_realizo_curso,
        'porcentajeDescuento', v_porcentaje_descuento,
        'valorBase', v_comp."valorMulta",
        'descuentoLey', v_descuento_aplicado,
        'subtotal', v_subtotal,
        'interesesMora', v_intereses_mora,
        'totalPagar', v_total_pagar,
        'fechaVencimientoDescuento', (v_fecha_infraccion + INTERVAL '20 days')::DATE,
        'fechaExigibilidadMora', v_fecha_vencimiento_plena,
        'estadoLiquidacion', v_estado_calculado
    );
END;
$$ LANGUAGE plpgsql;
