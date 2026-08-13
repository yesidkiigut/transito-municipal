import { WorkflowEngine } from '../../src/domain/entities/WorkflowEngine';
import { Tramite } from '../../src/domain/entities/Tramite';

describe('WorkflowEngine de Trámites', () => {
  it('debe permitir la transicion valida RADICADO -> EN_REVISION -> APROBADO -> FINALIZADO', () => {
    const tramite = new Tramite({
      id: 'trm-1',
      codigoTramite: 'T-2026-000001',
      tipoTramiteId: 'MATRICULA_INICIAL',
      ciudadanoSolicitanteId: 'ciud-1',
      estado: 'RADICADO',
    });

    expect(tramite.estado).toBe('RADICADO');

    tramite.cambiarEstado('EN_REVISION', 'func-01', 'Revisando documentos');
    expect(tramite.estado).toBe('EN_REVISION');

    tramite.cambiarEstado('APROBADO', 'func-01', 'Documentos aprobados');
    expect(tramite.estado).toBe('APROBADO');

    tramite.cambiarEstado('FINALIZADO', 'func-01', 'Trámite finalizado exitosamente');
    expect(tramite.estado).toBe('FINALIZADO');
    expect(tramite.fechaResolucion).toBeDefined();
  });

  it('debe rechazar la transicion invalida de RADICADO directamente a FINALIZADO', () => {
    const tramite = new Tramite({
      id: 'trm-2',
      codigoTramite: 'T-2026-000002',
      tipoTramiteId: 'MATRICULA_INICIAL',
      ciudadanoSolicitanteId: 'ciud-1',
      estado: 'RADICADO',
    });

    expect(() => tramite.cambiarEstado('FINALIZADO', 'func-01'))
      .toThrow("Transición de estado no permitida");
  });
});
