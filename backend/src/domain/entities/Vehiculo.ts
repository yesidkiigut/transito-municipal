export type TipoVehiculo = 'AUTOMOVIL' | 'MOTOCICLETA' | 'CAMION' | 'BUS' | 'BUSETA' | 'MICROBUS' | 'TRACTOCAMION';
export type ClaseServicio = 'PARTICULAR' | 'PUBLICO' | 'DIPLOMATICO' | 'OFICIAL';
export type EstadoVehiculo = 'ACTIVO' | 'INACTIVO' | 'ROBADO' | 'DESVINCULADO';

export interface PropietarioHistorico {
  ciudadanoId: string;
  fechaInicio: Date;
  fechaFin?: Date | null;
  esActual: boolean;
}

export interface VehiculoProps {
  id: string;
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  cilindraje: number;
  color: string;
  tipoVehiculo: TipoVehiculo;
  claseServicio: ClaseServicio;
  numeroMotor: string;
  numeroChasis: string;
  fechaMatricula: Date;
  estado?: EstadoVehiculo;
  propietarios?: PropietarioHistorico[];
}

export class Vehiculo {
  public readonly id: string;
  public readonly placa: string;
  public readonly marca: string;
  public readonly linea: string;
  public readonly modelo: number;
  public readonly cilindraje: number;
  public readonly color: string;
  public readonly tipoVehiculo: TipoVehiculo;
  public readonly claseServicio: ClaseServicio;
  public readonly numeroMotor: string;
  public readonly numeroChasis: string;
  public readonly fechaMatricula: Date;
  private _estado: EstadoVehiculo;
  private _propietarios: PropietarioHistorico[];

  constructor(props: VehiculoProps) {
    if (!props.placa || props.placa.trim().length < 5) {
      throw new Error('La placa debe tener formato válido');
    }

    this.id = props.id;
    this.placa = props.placa.toUpperCase();
    this.marca = props.marca;
    this.linea = props.linea;
    this.modelo = props.modelo;
    this.cilindraje = props.cilindraje;
    this.color = props.color;
    this.tipoVehiculo = props.tipoVehiculo;
    this.claseServicio = props.claseServicio;
    this.numeroMotor = props.numeroMotor;
    this.numeroChasis = props.numeroChasis;
    this.fechaMatricula = props.fechaMatricula;
    this._estado = props.estado || 'ACTIVO';
    this._propietarios = props.propietarios || [];
  }

  get estado(): EstadoVehiculo { return this._estado; }
  get propietarios(): PropietarioHistorico[] { return [...this._propietarios]; }

  public getPropietarioActual(): PropietarioHistorico | undefined {
    return this._propietarios.find(p => p.esActual);
  }

  public asignarPropietarioInicial(ciudadanoId: string): void {
    if (this._propietarios.some(p => p.esActual)) {
      throw new Error('El vehículo ya posee un propietario actual registrado');
    }
    this._propietarios.push({
      ciudadanoId,
      fechaInicio: new Date(),
      esActual: true,
    });
  }

  public transferirPropietario(nuevoCiudadanoId: string): void {
    const propietarioActual = this.getPropietarioActual();
    if (propietarioActual) {
      propietarioActual.esActual = false;
      propietarioActual.fechaFin = new Date();
    }
    this._propietarios.push({
      ciudadanoId: nuevoCiudadanoId,
      fechaInicio: new Date(),
      esActual: true,
    });
  }
}
