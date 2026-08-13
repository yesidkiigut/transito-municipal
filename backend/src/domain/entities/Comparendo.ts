export type EstadoComparendo = 'PENDIENTE' | 'PAGADO_EXTERNO' | 'NOTIFICADO' | 'FALLADO' | 'APELADO' | 'ARCHIVADO';

export interface ComparendoProps {
  id: string;
  numeroComparendo: string;
  placaVehiculo: string;
  ciudadanoId: string;
  tipoInfraccionId: string;
  fechaInfraccion: Date;
  lugarInfraccion: string;
  agenteTransitoId: string;
  observaciones?: string | null;
  evidencias?: string[];
  estado?: EstadoComparendo;
  valorMulta: number;
  gradoInfraccion: number;
  puntosDescuento: number;
}

export class Comparendo {
  public readonly id: string;
  public readonly numeroComparendo: string;
  public readonly placaVehiculo: string;
  public readonly ciudadanoId: string;
  public readonly tipoInfraccionId: string;
  public readonly fechaInfraccion: Date;
  public readonly lugarInfraccion: string;
  public readonly agenteTransitoId: string;
  public readonly observaciones?: string | null;
  public readonly evidencias: string[];
  private _estado: EstadoComparendo;
  public readonly valorMulta: number;
  public readonly gradoInfraccion: number;
  public readonly puntosDescuento: number;

  constructor(props: ComparendoProps) {
    this.id = props.id;
    this.numeroComparendo = props.numeroComparendo;
    this.placaVehiculo = props.placaVehiculo.toUpperCase();
    this.ciudadanoId = props.ciudadanoId;
    this.tipoInfraccionId = props.tipoInfraccionId;
    this.fechaInfraccion = props.fechaInfraccion;
    this.lugarInfraccion = props.lugarInfraccion;
    this.agenteTransitoId = props.agenteTransitoId;
    this.observaciones = props.observaciones;
    this.evidencias = props.evidencias || [];
    this._estado = props.estado || 'PENDIENTE';
    this.valorMulta = props.valorMulta;
    this.gradoInfraccion = props.gradoInfraccion;
    this.puntosDescuento = props.puntosDescuento;
  }

  get estado(): EstadoComparendo { return this._estado; }

  public static calcularDescuentoPuntosPorGrado(grado: number): number {
    switch (grado) {
      case 1: return 1;
      case 2: return 3;
      case 3: return 5;
      case 4: return 10;
      default: return 1;
    }
  }

  public calcularValorConProntoPago(diasHabilesTranscurridos: number, realizaCursoCIA: boolean): number {
    if (!realizaCursoCIA) {
      return this.valorMulta;
    }
    if (diasHabilesTranscurridos <= 5) {
      // 50% de descuento (Art. 136 Ley 769)
      return this.valorMulta * 0.5;
    } else if (diasHabilesTranscurridos <= 20) {
      // 25% de descuento (Art. 136 Ley 769 / Ley 1383)
      return this.valorMulta * 0.75;
    }
    return this.valorMulta;
  }

  public marcarNotificado(): void {
    if (this._estado === 'PENDIENTE') {
      this._estado = 'NOTIFICADO';
    }
  }

  public marcarPagadoExterno(): void {
    this._estado = 'PAGADO_EXTERNO';
  }

  public emitirResolucion(tipo: 'FALLA' | 'CONDENA' | 'ARCHIVO'): void {
    if (tipo === 'ARCHIVO') {
      this._estado = 'ARCHIVADO';
    } else {
      this._estado = 'FALLADO';
    }
  }
}
