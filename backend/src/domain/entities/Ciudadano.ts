import { Direccion } from '../value-objects/Direccion';

export type TipoDocumento = 'CC' | 'CE' | 'PASAPORTE' | 'NIT';
export type EstadoCiudadano = 'ACTIVO' | 'INACTIVO' | 'FALLECIDO';

export interface CiudadanoProps {
  id: string;
  usuarioId?: string | null;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date;
  correo: string;
  telefono: string;
  direccion: Direccion;
  estado?: EstadoCiudadano;
  fechaRegistro?: Date;
  updatedAt?: Date;
}

export class Ciudadano {
  public readonly id: string;
  public readonly usuarioId?: string | null;
  public readonly tipoDocumento: TipoDocumento;
  public readonly numeroDocumento: string;
  private _nombres: string;
  private _apellidos: string;
  private _fechaNacimiento: Date;
  private _correo: string;
  private _telefono: string;
  private _direccion: Direccion;
  private _estado: EstadoCiudadano;
  public readonly fechaRegistro: Date;
  public updatedAt: Date;

  constructor(props: CiudadanoProps) {
    if (!props.numeroDocumento || props.numeroDocumento.trim() === '') {
      throw new Error('El número de documento es obligatorio');
    }
    if (!props.nombres || !props.apellidos) {
      throw new Error('Los nombres y apellidos son obligatorios');
    }

    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.tipoDocumento = props.tipoDocumento;
    this.numeroDocumento = props.numeroDocumento;
    this._nombres = props.nombres;
    this._apellidos = props.apellidos;
    this._fechaNacimiento = props.fechaNacimiento;
    this._correo = props.correo;
    this._telefono = props.telefono;
    this._direccion = props.direccion;
    this._estado = props.estado || 'ACTIVO';
    this.fechaRegistro = props.fechaRegistro || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  get nombres(): string { return this._nombres; }
  get apellidos(): string { return this._apellidos; }
  get nombreCompleto(): string { return `${this._nombres} ${this._apellidos}`; }
  get fechaNacimiento(): Date { return this._fechaNacimiento; }
  get correo(): string { return this._correo; }
  get telefono(): string { return this._telefono; }
  get direccion(): Direccion { return this._direccion; }
  get estado(): EstadoCiudadano { return this._estado; }

  public calcularEdad(): number {
    const diff = Date.now() - this._fechaNacimiento.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  public actualizarDatosContacto(correo: string, telefono: string, direccion: Direccion): void {
    this._correo = correo;
    this._telefono = telefono;
    this._direccion = direccion;
    this.updatedAt = new Date();
  }

  public cambiarEstado(nuevoEstado: EstadoCiudadano): void {
    this._estado = nuevoEstado;
    this.updatedAt = new Date();
  }
}
