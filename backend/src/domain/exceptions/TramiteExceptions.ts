export class TransicionWorkflowInvalidaException extends Error {
  constructor(estadoActual: string, estadoNuevo: string) {
    super(
      `Transición de estado no permitida en el flujo del trámite: de '${estadoActual}' hacia '${estadoNuevo}'.`
    );
    this.name = 'TransicionWorkflowInvalidaException';
  }
}

export class TramiteNoEncontradoException extends Error {
  constructor(codigo: string) {
    super(`El trámite con código '${codigo}' no existe en el sistema.`);
    this.name = 'TramiteNoEncontradoException';
  }
}

export class TipoTramiteNoEncontradoException extends Error {
  constructor(codigo: string) {
    super(`El tipo de trámite con código '${codigo}' no está parametrizado.`);
    this.name = 'TipoTramiteNoEncontradoException';
  }
}
