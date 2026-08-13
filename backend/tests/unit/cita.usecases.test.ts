import { Cita } from '../../src/domain/entities/Cita';

describe('Reglas de Negocio en Citas y Agenda', () => {
  it('debe impedir la cancelacion de una cita si falta menos de 4 horas', () => {
    const fechaHoy = new Date();
    const horaActual = `${fechaHoy.getHours().toString().padStart(2, '0')}:${fechaHoy.getMinutes().toString().padStart(2, '0')}`;

    const citaProxima = new Cita({
      id: 'cit-prox',
      codigoCita: 'CIT-999',
      ciudadanoId: 'ciud-1',
      tipoTramiteId: 'MATRICULA_INICIAL',
      puestoAtencionId: 'pst-1',
      fechaCita: fechaHoy,
      horaInicio: horaActual,
      horaFin: '23:59',
      estado: 'RESERVADA',
    });

    expect(() => citaProxima.cancelar()).toThrow(
      'No es posible cancelar citas con menos de 4 horas de anticipación'
    );
  });
});
