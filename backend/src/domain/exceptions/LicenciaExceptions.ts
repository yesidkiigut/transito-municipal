export class EdadInsuficienteParaCategoriaException extends Error {
  constructor(categoria: string, edadMinima: number, edadActual: number) {
    super(
      `Edad insuficiente para solicitar la categoría '${categoria}'. Se requieren mínimo ${edadMinima} años y el ciudadano tiene ${edadActual} años.`
    );
    this.name = 'EdadInsuficienteParaCategoriaException';
  }
}

export class LicenciaVigenteExistenteException extends Error {
  constructor(categoria: string) {
    super(`El ciudadano ya posee una licencia vigente para la categoría '${categoria}'.`);
    this.name = 'LicenciaVigenteExistenteException';
  }
}

export class LicenciaNoEncontradaException extends Error {
  constructor(numero: string) {
    super(`No se encontró la licencia de conducción con número '${numero}'.`);
    this.name = 'LicenciaNoEncontradaException';
  }
}

export class NoAptoParaRenovacionException extends Error {
  constructor(motivo: string) {
    super(`La licencia no es apta para renovación: ${motivo}`);
    this.name = 'NoAptoParaRenovacionException';
  }
}
