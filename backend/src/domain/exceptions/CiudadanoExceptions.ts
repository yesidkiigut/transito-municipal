export class CiudadanoNoEncontradoException extends Error {
  constructor(criterio: string) {
    super(`El ciudadano con ${criterio} no fue encontrado en el sistema.`);
    this.name = 'CiudadanoNoEncontradoException';
  }
}

export class DocumentoYaRegistradoException extends Error {
  constructor(documento: string) {
    super(`El número de documento '${documento}' ya se encuentra registrado.`);
    this.name = 'DocumentoYaRegistradoException';
  }
}
