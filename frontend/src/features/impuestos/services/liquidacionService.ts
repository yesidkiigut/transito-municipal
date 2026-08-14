import { API_BASE_URL } from '@/config/api';

export interface ComparendoLiquidado {
  comparendoId: string;
  numeroComparendo: string;
  codigoInfraccion?: string;
  descripcionInfraccion?: string;
  fechaInfraccion?: string;
  fechaCorte?: string;
  diasHabiles?: number;
  diasCalendario?: number;
  realizoCurso?: boolean;
  porcentajeDescuento?: number;
  valorBase: number;
  descuentoLey: number;
  subtotal: number;
  interesesMora: number;
  totalPagar: number;
  fechaVencimientoDescuento?: string;
  fechaExigibilidadMora?: string;
  estadoLiquidacion: string;
  mensaje?: string;
}

export interface ImpuestoLiquidado {
  placa: string;
  vigenciaFiscal: number;
  avaluoComercial: number;
  uvtVigencia: number;
  avaluoEnUVT: number;
  tarifaPorcentaje: number;
  valorBaseImpuesto: number;
  descuentoProntoPago: number;
  descuentoTraslado: number;
  totalDescuentos: number;
  sancionExtemporaneidad: number;
  interesesMora: number;
  valorTotalPagar: number;
  fechaVencimiento: string;
  fechaCorte: string;
  estadoLiquidacion: string;
}

export interface EstadoCuentaResponse {
  fechaCorte: string;
  ciudadano?: {
    id: string;
    nombreCompleto: string;
    numeroDocumento: string;
  } | null;
  vehiculo?: {
    placa: string;
    marca: string;
    linea: string;
    modelo: number;
  } | null;
  resumenFinanciero: {
    totalCapital: number;
    totalInteresesMora: number;
    totalDescuentosVigentes: number;
    totalNetoPagar: number;
    tieneMoraActiva: boolean;
  };
  comparendos: Array<{
    id: string;
    numeroComparendo: string;
    placa: string;
    fechaInfraccion: string;
    valorBase: number;
    descuentoLey: number;
    interesesMora: number;
    totalPagar: number;
    estado: string;
  }>;
  impuestos: Array<{
    id: string;
    placa: string;
    vigenciaFiscal: number;
    avaluoComercial: number;
    valorBase: number;
    descuento: number;
    sancion: number;
    interesesMora: number;
    totalPagar: number;
    estado: string;
  }>;
  cuotasAcuerdos: Array<{
    id: string;
    codigoAcuerdo: string;
    numeroCuota: number;
    valorCapital: number;
    valorInteres: number;
    valorTotalCuota: number;
    fechaVencimiento: string;
    estado: string;
  }>;
  cronogramaMensual: Array<{
    mesAnio: string;
    nombreMes: string;
    capitalAcumulado: number;
    interesMoraMes: number;
    saldoTotalPeriodo: number;
  }>;
}

export interface CuotaSimulada {
  numero_cuota: number;
  fecha_vencimiento: string;
  valor_capital: number;
  valor_interes: number;
  valor_total_cuota: number;
  saldo_restante: number;
}

export interface SimulacionAcuerdoResponse {
  montoTotal: number;
  porcentajeInicial: number;
  montoInicial: number;
  saldoFinanciar: number;
  numeroCuotas: number;
  tasaInteresMensual: number;
  cuotas: CuotaSimulada[];
}

export const liquidacionService = {
  async liquidarComparendo(id: string, fechaCorte?: string, realizoCurso: boolean = false): Promise<ComparendoLiquidado> {
    const params = new URLSearchParams({ id, realizoCurso: String(realizoCurso) });
    if (fechaCorte) params.append('fechaCorte', fechaCorte);

    const res = await fetch(`/api/v1/liquidaciones/comparendo?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al liquidar comparendo' }));
      throw new Error(err.error || 'Error al liquidar comparendo');
    }
    return res.json();
  },

  async liquidarImpuesto(
    placa: string,
    vigencia: number = 2026,
    fechaCorte?: string,
    aplicaTraslado: boolean = false
  ): Promise<ImpuestoLiquidado> {
    const params = new URLSearchParams({
      placa,
      vigencia: String(vigencia),
      aplicaTraslado: String(aplicaTraslado),
    });
    if (fechaCorte) params.append('fechaCorte', fechaCorte);

    const res = await fetch(`/api/v1/liquidaciones/impuesto?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al liquidar impuesto' }));
      throw new Error(err.error || 'Error al liquidar impuesto');
    }
    return res.json();
  },

  async obtenerEstadoCuenta(params: { ciudadanoId?: string; placa?: string; meses?: number }): Promise<EstadoCuentaResponse> {
    const query = new URLSearchParams();
    if (params.ciudadanoId) query.append('ciudadanoId', params.ciudadanoId);
    if (params.placa) query.append('placa', params.placa);
    if (params.meses) query.append('meses', String(params.meses));

    const res = await fetch(`/api/v1/estado-cuenta?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al obtener estado de cuenta' }));
      throw new Error(err.error || 'Error al obtener estado de cuenta');
    }
    return res.json();
  },

  async simularAcuerdoPago(data: {
    montoTotal: number;
    porcentajeInicial?: number;
    numeroCuotas?: number;
    tasaInteres?: number;
    fechaInicio?: string;
  }): Promise<SimulacionAcuerdoResponse> {
    const res = await fetch('/api/v1/acuerdos-pago/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al simular acuerdo' }));
      throw new Error(err.error || 'Error al simular acuerdo');
    }
    return res.json();
  },

  async crearAcuerdoPago(data: any): Promise<any> {
    const res = await fetch('/api/v1/acuerdos-pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al formalizar acuerdo de pago' }));
      throw new Error(err.error || 'Error al formalizar acuerdo de pago');
    }
    return res.json();
  },

  async listarAcuerdos(params?: { ciudadanoId?: string; placa?: string; estado?: string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.ciudadanoId) query.append('ciudadanoId', params.ciudadanoId);
    if (params?.placa) query.append('placa', params.placa);
    if (params?.estado) query.append('estado', params.estado);

    const res = await fetch(`/api/v1/acuerdos-pago?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al listar acuerdos' }));
      throw new Error(err.error || 'Error al listar acuerdos');
    }
    return res.json();
  },

  async obtenerAcuerdoPorId(id: string): Promise<any> {
    const res = await fetch(`/api/v1/acuerdos-pago/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al obtener acuerdo' }));
      throw new Error(err.error || 'Error al obtener acuerdo');
    }
    return res.json();
  },

  async consultarTramosBeneficio(params: {
    tipoConcepto: 'COMPARENDO' | 'IMPUESTO_VEHICULAR';
    referenciaId: string;
    fechaCorte?: string;
    realizoCurso?: boolean;
  }): Promise<any> {
    const query = new URLSearchParams({
      tipoConcepto: params.tipoConcepto,
      referenciaId: params.referenciaId,
      realizoCurso: String(params.realizoCurso ?? false),
    });
    if (params.fechaCorte) query.append('fechaCorte', params.fechaCorte);

    const res = await fetch(`/api/v1/beneficios/tramos?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al consultar tramos de beneficio' }));
      throw new Error(err.error || 'Error al consultar tramos de beneficio');
    }
    return res.json();
  },

  async listarReglasDescuento(): Promise<any[]> {
    const res = await fetch('/api/v1/configuracion/reglas-descuento');
    if (!res.ok) throw new Error('Error al consultar reglas de descuento');
    const json = await res.json();
    return json.data || [];
  },

  async crearReglaDescuento(data: any): Promise<any> {
    const res = await fetch('/api/v1/configuracion/reglas-descuento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al guardar regla' }));
      throw new Error(err.error || 'Error al guardar regla');
    }
    return res.json();
  },

  async toggleReglaDescuento(id: string, activo: boolean): Promise<any> {
    const res = await fetch('/api/v1/configuracion/reglas-descuento', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, activo }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado de la regla');
    return res.json();
  },

  async listarParametrosAnuales(): Promise<any[]> {
    const res = await fetch('/api/v1/configuracion/parametros-anuales');
    if (!res.ok) throw new Error('Error al consultar parámetros');
    const json = await res.json();
    return json.data || [];
  },

  async guardarParametroAnual(data: any): Promise<any> {
    const res = await fetch('/api/v1/configuracion/parametros-anuales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al guardar parámetro' }));
      throw new Error(err.error || 'Error al guardar parámetro');
    }
    return res.json();
  },

  async listarTasasMora(): Promise<any[]> {
    const res = await fetch('/api/v1/configuracion/tasas-mora');
    if (!res.ok) throw new Error('Error al consultar tasas de mora');
    const json = await res.json();
    return json.data || [];
  },

  async registrarTasaMora(data: any): Promise<any> {
    const res = await fetch('/api/v1/configuracion/tasas-mora', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al registrar tasa' }));
      throw new Error(err.error || 'Error al registrar tasa');
    }
    return res.json();
  },

  async ejecutarLiquidacionMasiva(vigencia: number = 2026): Promise<any> {
    const res = await fetch('/api/v1/liquidaciones/masiva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vigenciaFiscal: vigencia }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al ejecutar liquidación masiva' }));
      throw new Error(err.error || 'Error al ejecutar liquidación masiva');
    }
    return res.json();
  },
};
