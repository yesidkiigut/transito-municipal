export type CanalPago = 'PSE' | 'BRE_B' | 'TARJETA' | 'VENTANILLA';
export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'EXPIRADO' | 'REVERSADO';
export type TipoConceptoPago = 'COMPARENDO' | 'IMPUESTO_VEHICULAR' | 'TRAMITE_LICENCIA' | 'TRAMITE_MATRICULA' | 'RODAMIENTO_MUNICIPAL';

export interface DetallePagoProps {
  id?: string;
  transaccionId?: string;
  tipoConcepto: TipoConceptoPago;
  referenciaConcepto: string;
  descripcion: string;
  codigoContable: string;
  valorBase: number;
  descuento: number;
  interesesMora: number;
  valorFinal: number;
}

export interface TransaccionPagoProps {
  id?: string;
  referenciaPago: string;
  ciudadanoId: string;
  montoTotal: number;
  canalPago: CanalPago;
  proveedorPasarela: string;
  estadoPago: EstadoPago;
  cus?: string | null;
  codigoTrazabilidad?: string | null;
  ipOrigen?: string | null;
  bancoPSE?: string | null;
  tipoPersonaPSE?: string | null;
  qrBreB?: string | null;
  llaveBreB?: string | null;
  fechaTransaccion?: Date;
  fechaAprobacion?: Date | null;
  fechaExpiracion?: Date | null;
  sincronizadoHassql?: boolean;
  fechaSincronizacion?: Date | null;
  referenciaAsientoHassql?: string | null;
  intentosSync?: number;
  logErrorSync?: string | null;
  reciboOficialNumero?: string | null;
  detalles?: DetallePagoProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class TransaccionPago {
  public readonly id?: string;
  public readonly referenciaPago: string;
  public readonly ciudadanoId: string;
  public readonly montoTotal: number;
  public canalPago: CanalPago;
  public proveedorPasarela: string;
  public estadoPago: EstadoPago;
  public cus?: string | null;
  public codigoTrazabilidad?: string | null;
  public ipOrigen?: string | null;
  public bancoPSE?: string | null;
  public tipoPersonaPSE?: string | null;
  public qrBreB?: string | null;
  public llaveBreB?: string | null;
  public readonly fechaTransaccion: Date;
  public fechaAprobacion?: Date | null;
  public fechaExpiracion?: Date | null;
  public sincronizadoHassql: boolean;
  public fechaSincronizacion?: Date | null;
  public referenciaAsientoHassql?: string | null;
  public intentosSync: number;
  public logErrorSync?: string | null;
  public reciboOficialNumero?: string | null;
  public detalles: DetallePagoProps[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: TransaccionPagoProps) {
    this.id = props.id;
    this.referenciaPago = props.referenciaPago;
    this.ciudadanoId = props.ciudadanoId;
    this.montoTotal = props.montoTotal;
    this.canalPago = props.canalPago || 'PSE';
    this.proveedorPasarela = props.proveedorPasarela || 'PSE_ACH';
    this.estadoPago = props.estadoPago || 'PENDIENTE';
    this.cus = props.cus;
    this.codigoTrazabilidad = props.codigoTrazabilidad;
    this.ipOrigen = props.ipOrigen;
    this.bancoPSE = props.bancoPSE;
    this.tipoPersonaPSE = props.tipoPersonaPSE;
    this.qrBreB = props.qrBreB;
    this.llaveBreB = props.llaveBreB;
    this.fechaTransaccion = props.fechaTransaccion || new Date();
    this.fechaAprobacion = props.fechaAprobacion;
    this.fechaExpiracion = props.fechaExpiracion;
    this.sincronizadoHassql = props.sincronizadoHassql ?? false;
    this.fechaSincronizacion = props.fechaSincronizacion;
    this.referenciaAsientoHassql = props.referenciaAsientoHassql;
    this.intentosSync = props.intentosSync || 0;
    this.logErrorSync = props.logErrorSync;
    this.reciboOficialNumero = props.reciboOficialNumero;
    this.detalles = props.detalles || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public aprobar(cus: string, codigoTrazabilidad?: string): void {
    this.estadoPago = 'APROBADO';
    this.cus = cus;
    this.codigoTrazabilidad = codigoTrazabilidad || `BANREP-${Date.now()}`;
    this.fechaAprobacion = new Date();
    this.reciboOficialNumero = `REC-TRM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  public rechazar(motivo?: string): void {
    this.estadoPago = 'RECHAZADO';
    this.logErrorSync = motivo;
  }
}
