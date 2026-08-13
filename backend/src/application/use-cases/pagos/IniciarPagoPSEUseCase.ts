import { ITransaccionPagoRepository } from '../../../domain/ports/outgoing/ITransaccionPagoRepository';
import { TransaccionPago } from '../../../domain/entities/TransaccionPago';
import { IniciarPagoPSEInput, RespuestaInicioPagoDTO } from '../../dto/pagos/PagoDTOs';

export class IniciarPagoPSEUseCase {
  constructor(private readonly repo: ITransaccionPagoRepository) {}

  public async execute(input: IniciarPagoPSEInput): Promise<RespuestaInicioPagoDTO> {
    const timestamp = Date.now();
    const referenciaPago = `TRM-PSE-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cus = `CUS-ACH-${timestamp}`;
    const montoTotal = input.conceptos.reduce((sum, c) => sum + c.valorFinal, 0);

    const transaccion = new TransaccionPago({
      referenciaPago,
      ciudadanoId: input.ciudadanoId,
      montoTotal,
      canalPago: 'PSE',
      proveedorPasarela: 'PSE_ACH_COLOMBIA',
      estadoPago: 'PENDIENTE',
      cus,
      bancoPSE: input.bancoCodigo,
      tipoPersonaPSE: input.tipoPersona,
      fechaTransaccion: new Date(),
      fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
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

    // URL simulada de redirección segura de PSE
    const urlPasarela = `/portal-pagos/pasarela-pse?referencia=${guardada.referenciaPago}&cus=${cus}&banco=${input.bancoCodigo}&total=${montoTotal}`;

    return {
      referenciaPago: guardada.referenciaPago,
      cus,
      montoTotal: guardada.montoTotal,
      canalPago: 'PSE',
      estadoPago: guardada.estadoPago,
      urlPasarela,
      fechaTransaccion: guardada.fechaTransaccion.toISOString(),
      fechaExpiracion: guardada.fechaExpiracion?.toISOString(),
    };
  }
}
