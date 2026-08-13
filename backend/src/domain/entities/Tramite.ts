import { WorkflowEngine } from './WorkflowEngine';

export type EstadoTramite =
  | 'RADICADO'
  | 'EN_REVISION'
  | 'EN_ESPERA_DOC'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface HistorialTramiteRecord {
  id: string;
  paso: string;
  estadoAnterior: EstadoTramite;
  estadoNuevo: EstadoTramite;
  funcionarioId: string;
  observacion?: string | null;
  fecha: Date;
}

export interface TramiteProps {
  id: string;
  codigoTramite: string;
  tipoTramiteId: string;
  ciudadanoSolicitanteId: string;
  vehiculoId?: string | null;
  licenciaId?: string | null;
  estado?: EstadoTramite;
  observaciones?: string | null;
  fechaRadicado?: Date;
  fechaResolucion?: Date | null;
  funcionarioAsignadoId?: string | null;
  historial?: HistorialTramiteRecord[];
}

export class Tramite {
  public readonly id: string;
  public readonly codigoTramite: string;
  public readonly tipoTramiteId: string;
  public readonly ciudadanoSolicitanteId: string;
  public readonly vehiculoId?: string | null;
  public readonly licenciaId?: string | null;
  private _estado: EstadoTramite;
  public observaciones?: string | null;
  public readonly fechaRadicado: Date;
  public fechaResolucion?: Date | null;
  public funcionarioAsignadoId?: string | null;
  private _historial: HistorialTramiteRecord[];

  constructor(props: TramiteProps) {
    this.id = props.id;
    this.codigoTramite = props.codigoTramite;
    this.tipoTramiteId = props.tipoTramiteId;
    this.ciudadanoSolicitanteId = props.ciudadanoSolicitanteId;
    this.vehiculoId = props.vehiculoId;
    this.licenciaId = props.licenciaId;
    this._estado = props.estado || 'RADICADO';
    this.observaciones = props.observaciones;
    this.fechaRadicado = props.fechaRadicado || new Date();
    this.fechaResolucion = props.fechaResolucion;
    this.funcionarioAsignadoId = props.funcionarioAsignadoId;
    this._historial = props.historial || [];
  }

  get estado(): EstadoTramite { return this._estado; }
  get historial(): HistorialTramiteRecord[] { return [...this._historial]; }

  public cambiarEstado(
    nuevoEstado: EstadoTramite,
    funcionarioId: string,
    observacion?: string,
    pasoNombre: string = 'Cambio de estado'
  ): void {
    // 1. Validar la transición mediante el Workflow Engine
    WorkflowEngine.validarTransicion(this._estado, nuevoEstado);

    const estadoAnterior = this._estado;
    this._estado = nuevoEstado;

    if (WorkflowEngine.esEstadoFinal(nuevoEstado)) {
      this.fechaResolucion = new Date();
    }

    // 2. Registrar en el historial de transiciones
    this._historial.push({
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paso: pasoNombre,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      funcionarioId,
      observacion,
      fecha: new Date(),
    });
  }

  public asignarFuncionario(funcionarioId: string): void {
    this.funcionarioAsignadoId = funcionarioId;
  }
}
