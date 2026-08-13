export interface ImpuestoVehicularProps {
  id?: string;
  placaVehiculo: string;
  vigenciaFiscal: number;
  avaluoComercial: number;
  valorBaseImpuesto?: number;
  sancionMora?: number;
  interesesMora?: number;
  descuentoProntoPago?: number;
  valorTotalPagar?: number;
  estado?: 'PENDIENTE' | 'PAGADO' | 'EN_MORA' | 'ANULADO';
  fechaVencimiento: Date;
  fechaPago?: Date | null;
  reciboPagoRef?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ImpuestoVehicular {
  private readonly _id: string;
  private readonly _placaVehiculo: string;
  private readonly _vigenciaFiscal: number;
  private readonly _avaluoComercial: number;
  private _valorBaseImpuesto: number;
  private _sancionMora: number;
  private _interesesMora: number;
  private _descuentoProntoPago: number;
  private _valorTotalPagar: number;
  private _estado: 'PENDIENTE' | 'PAGADO' | 'EN_MORA' | 'ANULADO';
  private readonly _fechaVencimiento: Date;
  private _fechaPago: Date | null;
  private _reciboPagoRef: string | null;

  constructor(props: ImpuestoVehicularProps) {
    this._id = props.id || '';
    this._placaVehiculo = props.placaVehiculo.toUpperCase();
    this._vigenciaFiscal = props.vigenciaFiscal;
    this._avaluoComercial = props.avaluoComercial;
    this._fechaVencimiento = props.fechaVencimiento;
    this._fechaPago = props.fechaPago || null;
    this._reciboPagoRef = props.reciboPagoRef || null;
    this._estado = props.estado || 'PENDIENTE';

    // 1. Calcular Impuesto Base (1.5% del avalúo comercial para servicio público en Colombia)
    this._valorBaseImpuesto = props.valorBaseImpuesto ?? Math.round(this._avaluoComercial * 0.015);
    this._sancionMora = props.sancionMora || 0;
    this._interesesMora = props.interesesMora || 0;
    this._descuentoProntoPago = props.descuentoProntoPago || 0;
    this._valorTotalPagar = props.valorTotalPagar ?? (this._valorBaseImpuesto + this._sancionMora + this._interesesMora - this._descuentoProntoPago);
  }

  public recalcularLiquidacion(
    fechaCalculo: Date = new Date(),
    aplicaDescuentoProntoPago: boolean = false,
    aplicaDescuentoTrasladoCuenta: boolean = false
  ): void {
    let descuentoTotal = 0;

    // Descuento de Pronto Pago (10% si paga antes de la fecha de vencimiento)
    if (aplicaDescuentoProntoPago && fechaCalculo <= this._fechaVencimiento) {
      descuentoTotal += Math.round(this._valorBaseImpuesto * 0.10);
    }

    // Descuento por Matrícula / Traslado de Cuenta al Municipio (50% en el primer año)
    if (aplicaDescuentoTrasladoCuenta) {
      descuentoTotal += Math.round(this._valorBaseImpuesto * 0.50);
    }

    this._descuentoProntoPago = descuentoTotal;

    // Sanción e Intereses de Mora si la fecha de cálculo supera el vencimiento
    if (fechaCalculo > this._fechaVencimiento) {
      const msDiff = fechaCalculo.getTime() - this._fechaVencimiento.getTime();
      const diasMora = Math.ceil(msDiff / (1000 * 3600 * 24));
      const mesesMora = Math.ceil(diasMora / 30);

      // Sanción Mínima por Extemporaneidad (Art. 641 ET Colombia - Mínimo $235,000 COP)
      const sancionCalculada = Math.round(this._valorBaseImpuesto * 0.05 * mesesMora);
      this._sancionMora = Math.max(235000, sancionCalculada);

      // Interés Moratorio Diario (Tasa EA de mora ~ 2.2% mensual)
      this._interesesMora = Math.round(this._valorBaseImpuesto * (0.022 / 30) * diasMora);
      this._estado = 'EN_MORA';
    } else {
      this._sancionMora = 0;
      this._interesesMora = 0;
      if (this._estado !== 'PAGADO') {
        this._estado = 'PENDIENTE';
      }
    }

    this._valorTotalPagar = Math.max(0, this._valorBaseImpuesto + this._sancionMora + this._interesesMora - this._descuentoProntoPago);
  }

  public registrarPagoExitoso(referenciaPago: string): void {
    this._estado = 'PAGADO';
    this._fechaPago = new Date();
    this._reciboPagoRef = referenciaPago;
  }

  // Getters
  public get id(): string { return this._id; }
  public get placaVehiculo(): string { return this._placaVehiculo; }
  public get vigenciaFiscal(): number { return this._vigenciaFiscal; }
  public get avaluoComercial(): number { return this._avaluoComercial; }
  public get valorBaseImpuesto(): number { return this._valorBaseImpuesto; }
  public get sancionMora(): number { return this._sancionMora; }
  public get interesesMora(): number { return this._interesesMora; }
  public get descuentoProntoPago(): number { return this._descuentoProntoPago; }
  public get valorTotalPagar(): number { return this._valorTotalPagar; }
  public get estado(): 'PENDIENTE' | 'PAGADO' | 'EN_MORA' | 'ANULADO' { return this._estado; }
  public get fechaVencimiento(): Date { return this._fechaVencimiento; }
  public get fechaPago(): Date | null { return this._fechaPago; }
  public get reciboPagoRef(): string | null { return this._reciboPagoRef; }
}
