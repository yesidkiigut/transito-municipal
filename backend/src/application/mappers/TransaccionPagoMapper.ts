import { TransaccionPago } from '../../domain/entities/TransaccionPago';

export class TransaccionPagoMapper {
  public static toDomain(raw: any): TransaccionPago {
    return new TransaccionPago({
      id: raw.id,
      referenciaPago: raw.referenciaPago,
      ciudadanoId: raw.ciudadanoId,
      montoTotal: raw.montoTotal,
      canalPago: raw.canalPago,
      proveedorPasarela: raw.proveedorPasarela,
      estadoPago: raw.estadoPago,
      cus: raw.cus,
      codigoTrazabilidad: raw.codigoTrazabilidad,
      ipOrigen: raw.ipOrigen,
      bancoPSE: raw.bancoPSE,
      tipoPersonaPSE: raw.tipoPersonaPSE,
      qrBreB: raw.qrBreB,
      llaveBreB: raw.llaveBreB,
      fechaTransaccion: raw.fechaTransaccion,
      fechaAprobacion: raw.fechaAprobacion,
      fechaExpiracion: raw.fechaExpiracion,
      sincronizadoHassql: raw.sincronizadoHassql,
      fechaSincronizacion: raw.fechaSincronizacion,
      referenciaAsientoHassql: raw.referenciaAsientoHassql,
      intentosSync: raw.intentosSync,
      logErrorSync: raw.logErrorSync,
      reciboOficialNumero: raw.reciboOficialNumero,
      detalles: raw.detalles
        ? raw.detalles.map((d: any) => ({
            id: d.id,
            transaccionId: d.transaccionId,
            tipoConcepto: d.tipoConcepto,
            referenciaConcepto: d.referenciaConcepto,
            descripcion: d.descripcion,
            codigoContable: d.codigoContable,
            valorBase: d.valorBase,
            descuento: d.descuento,
            interesesMora: d.interesesMora,
            valorFinal: d.valorFinal,
          }))
        : [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPersistence(entity: TransaccionPago): any {
    return {
      referenciaPago: entity.referenciaPago,
      ciudadanoId: entity.ciudadanoId,
      montoTotal: entity.montoTotal,
      canalPago: entity.canalPago,
      proveedorPasarela: entity.proveedorPasarela,
      estadoPago: entity.estadoPago,
      cus: entity.cus,
      codigoTrazabilidad: entity.codigoTrazabilidad,
      ipOrigen: entity.ipOrigen,
      bancoPSE: entity.bancoPSE,
      tipoPersonaPSE: entity.tipoPersonaPSE,
      qrBreB: entity.qrBreB,
      llaveBreB: entity.llaveBreB,
      fechaTransaccion: entity.fechaTransaccion,
      fechaAprobacion: entity.fechaAprobacion,
      fechaExpiracion: entity.fechaExpiracion,
      sincronizadoHassql: entity.sincronizadoHassql,
      fechaSincronizacion: entity.fechaSincronizacion,
      referenciaAsientoHassql: entity.referenciaAsientoHassql,
      intentosSync: entity.intentosSync,
      logErrorSync: entity.logErrorSync,
      reciboOficialNumero: entity.reciboOficialNumero,
    };
  }
}
