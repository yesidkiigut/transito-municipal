export class VehiculoNoEncontradoException extends Error {
  constructor(criterio: string) {
    super(`El vehículo con placa '${criterio}' no fue encontrado.`);
    this.name = 'VehiculoNoEncontradoException';
  }
}

export class PlacaYaRegistradaException extends Error {
  constructor(placa: string) {
    super(`La placa '${placa}' ya se encuentra registrada en el sistema de tránsito.`);
    this.name = 'PlacaYaRegistradaException';
  }
}

export class VehiculoConComparendosPendientesException extends Error {
  constructor(placa: string, comparendosPendientesCount: number) {
    super(
      `No se puede realizar el traspaso del vehículo '${placa}'. Tiene ${comparendosPendientesCount} comparendo(s) pendiente(s) de resolución o pago.`
    );
    this.name = 'VehiculoConComparendosPendientesException';
  }
}
