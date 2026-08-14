export interface ComparendoLiquidadoResult {
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
  error?: string;
}

export interface ImpuestoVehicularLiquidadoResult {
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
  error?: string;
}

export interface CuotaSimuladaResult {
  numero_cuota: number;
  fecha_vencimiento: string;
  valor_capital: number;
  valor_interes: number;
  valor_total_cuota: number;
  saldo_restante: number;
}

export interface EstadoCuentaMensualResult {
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

export interface CrearAcuerdoParams {
  ciudadanoId: string;
  placa?: string;
  montoTotal: number;
  porcentajeInicial: number;
  numeroCuotas: number;
  tasaInteres?: number;
  detallesDeuda?: Array<{
    tipoConcepto: string;
    referenciaConcepto: string;
    montoCapital: number;
    montoIntereses: number;
    montoTotal: number;
  }>;
  funcionarioId?: string;
}

export interface ILiquidacionRepository {
  liquidarComparendo(comparendoId: string, fechaCorte?: Date, realizoCurso?: boolean): Promise<ComparendoLiquidadoResult>;
  liquidarImpuestoVehicular(placa: string, vigencia: number, fechaCorte?: Date, aplicaTraslado?: boolean): Promise<ImpuestoVehicularLiquidadoResult>;
  simularAcuerdoPago(montoTotal: number, porcentajeInicial?: number, numeroCuotas?: number, tasaInteres?: number, fechaInicio?: Date): Promise<CuotaSimuladaResult[]>;
  crearAcuerdoPagoTransaccional(params: CrearAcuerdoParams): Promise<any>;
  obtenerEstadoCuentaMensual(ciudadanoId?: string, placa?: string, mesesHistoria?: number): Promise<EstadoCuentaMensualResult>;
  calcularTramosDescuento(tipoConcepto: string, referenciaId: string, fechaCorte?: Date, realizoCurso?: boolean): Promise<any>;
}
