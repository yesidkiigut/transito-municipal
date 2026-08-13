export class ComparendoNoEncontradoException extends Error {
  constructor(numero: string) {
    super(`El comparendo con número '${numero}' no fue encontrado.`);
    this.name = 'ComparendoNoEncontradoException';
  }
}

export class ComparendoYaResolucionadoException extends Error {
  constructor(numero: string) {
    super(`El comparendo '${numero}' ya fue objeto de resolución previamente.`);
    this.name = 'ComparendoYaResolucionadoException';
  }
}

export class TipoInfraccionNoValidoException extends Error {
  constructor(id: string) {
    super(`El tipo de infracción '${id}' no se encuentra parametrizado en la tabla CNSV.`);
    this.name = 'TipoInfraccionNoValidoException';
  }
}
