export type CategoriaLicencia = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3';
export type EstadoLicencia = 'VIGENTE' | 'VENCIDA' | 'SUSPENDIDA' | 'CANCELADA';

export interface LicenciaProps {
  id: string;
  numeroLicencia: string;
  ciudadanoId: string;
  categoria: CategoriaLicencia;
  fechaExpedicion: Date;
  fechaVencimiento: Date;
  estado?: EstadoLicencia;
  restricciones?: string[];
  organismoExpedidor?: string;
  puntosAcumulados?: number;
}

export class Licencia {
  public readonly id: string;
  public readonly numeroLicencia: string;
  public readonly ciudadanoId: string;
  public readonly categoria: CategoriaLicencia;
  public readonly fechaExpedicion: Date;
  public fechaVencimiento: Date;
  private _estado: EstadoLicencia;
  public readonly restricciones: string[];
  public readonly organismoExpedidor: string;
  private _puntosAcumulados: number;

  constructor(props: LicenciaProps) {
    this.id = props.id;
    this.numeroLicencia = props.numeroLicencia;
    this.ciudadanoId = props.ciudadanoId;
    this.categoria = props.categoria;
    this.fechaExpedicion = props.fechaExpedicion;
    this.fechaVencimiento = props.fechaVencimiento;
    this._estado = props.estado || 'VIGENTE';
    this.restricciones = props.restricciones || [];
    this.organismoExpedidor = props.organismoExpedidor || 'Tránsito Municipal';
    this._puntosAcumulados = props.puntosAcumulados ?? 12; // Máximo 12 puntos por defecto
  }

  get estado(): EstadoLicencia { return this._estado; }
  get puntosAcumulados(): number { return this._puntosAcumulados; }

  public static obtenerEdadMinima(categoria: CategoriaLicencia): number {
    if (['A1', 'A2', 'B1', 'B2', 'B3'].includes(categoria)) return 16;
    if (['C1', 'C2', 'C3'].includes(categoria)) return 18; // Ley 769 Art. 19: 18 años para servicio público
    return 16;
  }

  public static calcularVigenciaAnios(categoria: CategoriaLicencia, edadCiudadano: number): number {
    const esServicioPublico = ['C1', 'C2', 'C3'].includes(categoria);

    if (esServicioPublico) {
      // Ley 2161 de 2021: Servicio público 3 años (< 60) o 1 año (>= 60)
      return edadCiudadano < 60 ? 3 : 1;
    } else {
      // Servicio Particular / Motos: 10 años (< 60), 5 años (60-80), 1 año (> 80)
      if (edadCiudadano < 60) return 10;
      if (edadCiudadano <= 80) return 5;
      return 1;
    }
  }

  public descontarPuntos(puntos: number): void {
    this._puntosAcumulados = Math.max(0, this._puntosAcumulados - puntos);
    if (this._puntosAcumulados === 0) {
      this._estado = 'SUSPENDIDA';
    }
  }

  public renovar(nuevaFechaVencimiento: Date): void {
    if (this._estado === 'SUSPENDIDA' || this._estado === 'CANCELADA') {
      throw new Error('No se puede renovar una licencia suspendida o cancelada');
    }
    this.fechaVencimiento = nuevaFechaVencimiento;
    this._estado = 'VIGENTE';
    this._puntosAcumulados = 12; // Restablece puntos tras curso/renovación
  }

  public suspender(): void {
    this._estado = 'SUSPENDIDA';
  }
}
