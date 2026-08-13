import { ITransaccionPagoRepository } from '../../../domain/ports/outgoing/ITransaccionPagoRepository';
import { TransaccionPago } from '../../../domain/entities/TransaccionPago';
import { IniciarPagoBreBInput, RespuestaInicioPagoDTO } from '../../dto/pagos/PagoDTOs';

export class IniciarPagoBreBUseCase {
  constructor(private readonly repo: ITransaccionPagoRepository) {}

  public async execute(input: IniciarPagoBreBInput): Promise<RespuestaInicioPagoDTO> {
    const timestamp = Date.now();
    const referenciaPago = `TRM-BREB-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const codigoTrazabilidad = `BREB-BANREP-E2E-${timestamp}`;
    const montoTotal = input.conceptos.reduce((sum, c) => sum + c.valorFinal, 0);

    // Generar formato payload estándar interoperable Bre-B Banco de la República
    const llaveInstitucional = '8901234567'; // NIT Institucional Alcaldía de Tránsito
    const qrPayload = JSON.stringify({
      scheme: 'BRE_B_BANREP',
      version: '1.0',
      merchantName: 'Secretaria de Transito Municipal',
      merchantCity: 'San Mateo',
      merchantKey: llaveInstitucional,
      keyType: 'NIT',
      amount: montoTotal,
      currency: 'COP',
      reference: referenciaPago,
      endToEndId: codigoTrazabilidad,
      expiresAt: new Date(timestamp + 10 * 60 * 1000).toISOString(), // 10 minutos
    });

    const transaccion = new TransaccionPago({
      referenciaPago,
      ciudadanoId: input.ciudadanoId,
      montoTotal,
      canalPago: 'BRE_B',
      proveedorPasarela: 'BANCO_REPUBLICA_BRE_B',
      estadoPago: 'PENDIENTE',
      codigoTrazabilidad,
      qrBreB: qrPayload,
      llaveBreB: llaveInstitucional,
      fechaTransaccion: new Date(),
      fechaExpiracion: new Date(timestamp + 10 * 60 * 1000), // Bre-B expira en 10 min
      detalles: input.conceptos.map((c) => ({
        tipoConcepto: c.tipoConcepto,
        referenciaConcepto: c.referenciaConcepto,
        descripcion: c.descripcion,
        codigoContable: c.codigoContable || '2.1.2.02.02',
        valorBase: c.valorBase,
        descuento: c.descuento,
        interesesMora: c.interesesMora,
        valorFinal: c.valorFinal,
      })),
    });

    const guardada = await this.repo.crearTransaccion(transaccion);

    return {
      referenciaPago: guardada.referenciaPago,
      montoTotal: guardada.montoTotal,
      canalPago: 'BRE_B',
      estadoPago: guardada.estadoPago,
      qrBreB: qrPayload,
      llaveBreB: llaveInstitucional,
      fechaTransaccion: guardada.fechaTransaccion.toISOString(),
      fechaExpiracion: guardada.fechaExpiracion?.toISOString(),
    };
  }
}
