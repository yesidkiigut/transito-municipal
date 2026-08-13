import { ITransaccionPagoRepository } from '../../../domain/ports/outgoing/ITransaccionPagoRepository';
import { prisma } from '../../../infrastructure/persistence/prisma/client';

export class ProcesarConfirmacionPagoUseCase {
  constructor(private readonly repo: ITransaccionPagoRepository) {}

  public async execute(referenciaPago: string, cusAprobacion?: string, codigoTrazabilidad?: string): Promise<any> {
    const transaccion = await this.repo.obtenerPorReferencia(referenciaPago);
    if (!transaccion) {
      throw new Error(`Transacción con referencia ${referenciaPago} no encontrada.`);
    }

    if (transaccion.estadoPago === 'APROBADO') {
      return transaccion;
    }

    const cusFinal = cusAprobacion || transaccion.cus || `CUS-APROB-${Date.now()}`;
    transaccion.aprobar(cusFinal, codigoTrazabilidad);

    // 1. Actualizar estado de la transacción
    const actualizada = await this.repo.actualizarEstado(transaccion);

    // 2. Descargar cartera en la base de datos municipal
    for (const detalle of transaccion.detalles) {
      if (detalle.tipoConcepto === 'COMPARENDO') {
        await prisma.comparendo.updateMany({
          where: { numeroComparendo: detalle.referenciaConcepto },
          data: { estado: 'PAGADO_EXTERNO' },
        });
      } else if (detalle.tipoConcepto === 'IMPUESTO_VEHICULAR') {
        const partes = detalle.referenciaConcepto.split('-');
        const placa = partes[0];
        const vigencia = parseInt(partes[1]) || new Date().getFullYear();

        await prisma.impuestoVehicular.updateMany({
          where: { placaVehiculo: placa, vigenciaFiscal: vigencia },
          data: {
            estado: 'PAGADO',
            fechaPago: new Date(),
            reciboPagoRef: actualizada.reciboOficialNumero,
          },
        });
      } else if (detalle.tipoConcepto === 'RODAMIENTO_MUNICIPAL') {
        const partes = detalle.referenciaConcepto.replace('ROD-', '').split('-');
        const placa = partes[0];
        await prisma.rodamientoMunicipal.updateMany({
          where: { placaVehiculo: placa },
          data: { estaPazYSalvo: true, certificadoRef: actualizada.reciboOficialNumero },
        });
      }
    }

    return actualizada;
  }
}
