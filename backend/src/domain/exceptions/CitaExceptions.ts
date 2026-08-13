export class CitaNoEncontradaException extends Error {
  constructor(codigo: string) {
    super(`La cita con código '${codigo}' no fue encontrada.`);
    this.name = 'CitaNoEncontradaException';
  }
}

export class CitaActivaExistenteException extends Error {
  constructor(tipoTramiteId: string) {
    super(
      `El ciudadano ya posee una cita activa o reservada para el tipo de trámite '${tipoTramiteId}'. Solo se permite 1 cita activa por trámite.`
    );
    this.name = 'CitaActivaExistenteException';
  }
}

export class CancelacionCitaTardiaException extends Error {
  constructor() {
    super('No es posible cancelar citas con menos de 4 horas de anticipación. Se aplicará penalización por no presentarse.');
    this.name = 'CancelacionCitaTardiaException';
  }
}
