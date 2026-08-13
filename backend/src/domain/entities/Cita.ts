import { CancelacionCitaTardiaException } from '../exceptions/CitaExceptions';

export type EstadoCita = 'DISPONIBLE' | 'RESERVADA' | 'CONFIRMADA' | 'CANCELADA' | 'ATENDIDA' | 'NO_SHOW';

export interface CitaProps {
  id: string;
  codigoCita: string;
  ciudadanoId: string;
  tipoTramiteId: string;
  puestoAtencionId: string;
  fechaCita: Date;
  horaInicio: string;
  horaFin: string;
  estado?: EstadoCita;
}

export class Cita {
  public readonly id: string;
  public readonly codigoCita: string;
  public readonly ciudadanoId: string;
  public readonly tipoTramiteId: string;
  public readonly puestoAtencionId: string;
  public readonly fechaCita: Date;
  public readonly horaInicio: string;
  public readonly horaFin: string;
  private _estado: EstadoCita;

  constructor(props: CitaProps) {
    this.id = props.id;
    this.codigoCita = props.codigoCita;
    this.ciudadanoId = props.ciudadanoId;
    this.tipoTramiteId = props.tipoTramiteId;
    this.puestoAtencionId = props.puestoAtencionId;
    this.fechaCita = props.fechaCita;
    this.horaInicio = props.horaInicio;
    this.horaFin = props.horaFin;
    this._estado = props.estado || 'RESERVADA';
  }

  get estado(): EstadoCita { return this._estado; }

  public cancelar(): void {
    // REGLA DE NEGOCIO: Validar que falten al menos 4 horas antes de la cita
    const ahora = new Date();
    const fechaHoraCita = new Date(this.fechaCita);
    const [horas, minutos] = this.horaInicio.split(':').map(Number);
    fechaHoraCita.setHours(horas, minutos, 0, 0);

    const diferenciaHoras = (fechaHoraCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (diferenciaHoras < 4) {
      throw new CancelacionCitaTardiaException();
    }

    this._estado = 'CANCELADA';
  }

  public marcarAtendida(): void {
    this._estado = 'ATENDIDA';
  }

  public marcarNoShow(): void {
    this._estado = 'NO_SHOW';
  }
}
