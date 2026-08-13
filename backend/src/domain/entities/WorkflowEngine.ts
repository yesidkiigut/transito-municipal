import { EstadoTramite } from './Tramite';
import { TransicionWorkflowInvalidaException } from '../exceptions/TramiteExceptions';

export class WorkflowEngine {
  // Mapa estricto de transiciones de estados de trámites permitidas
  private static readonly transicionesPermitidas: Record<EstadoTramite, EstadoTramite[]> = {
    RADICADO: ['EN_REVISION', 'CANCELADO'],
    EN_REVISION: ['EN_ESPERA_DOC', 'APROBADO', 'RECHAZADO', 'CANCELADO'],
    EN_ESPERA_DOC: ['EN_REVISION', 'CANCELADO'],
    APROBADO: ['FINALIZADO', 'CANCELADO'],
    RECHAZADO: [],
    FINALIZADO: [],
    CANCELADO: [],
  };

  public static validarTransicion(estadoActual: EstadoTramite, estadoNuevo: EstadoTramite): void {
    const permitidas = this.transicionesPermitidas[estadoActual] || [];
    if (!permitidas.includes(estadoNuevo)) {
      throw new TransicionWorkflowInvalidaException(estadoActual, estadoNuevo);
    }
  }

  public static esEstadoFinal(estado: EstadoTramite): boolean {
    return ['FINALIZADO', 'RECHAZADO', 'CANCELADO'].includes(estado);
  }
}
