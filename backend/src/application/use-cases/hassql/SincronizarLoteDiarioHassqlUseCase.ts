import { prisma } from '../../../infrastructure/persistence/prisma/client';
import { HassqlIntegrationService } from '../../../infrastructure/external/hassql/HassqlIntegrationService';
import { ConfiguracionHassql } from '../../../domain/entities/ConfiguracionHassql';
import { PaqueteRecaudoHassql, RespuestaSincronizacionHassqlDTO } from '../../dto/hassql/HassqlDTOs';

export class SincronizarLoteDiarioHassqlUseCase {
  private readonly hassqlService = new HassqlIntegrationService();

  public async execute(): Promise<RespuestaSincronizacionHassqlDTO> {
    // 1. Obtener configuración activa de HASSQL
    let configRecord = await prisma.configuracionHassql.findFirst({
      where: { activo: true },
    });

    if (!configRecord) {
      const defecto = ConfiguracionHassql.crearDefecto();
      configRecord = await prisma.configuracionHassql.create({
        data: {
          servidorHost: defecto.servidorHost,
          puerto: defecto.puerto,
          baseDatos: defecto.baseDatos,
          usuario: defecto.usuario,
          password: defecto.password,
          tipoConexion: defecto.tipoConexion,
          tokenApi: defecto.tokenApi,
          endpointRecaudo: defecto.endpointRecaudo,
          horaCierreFiscal: defecto.horaCierreFiscal,
          activo: defecto.activo,
          autoSincronizar: defecto.autoSincronizar,
          formatoAsobancaria: defecto.formatoAsobancaria,
          codigoEntidadHassql: defecto.codigoEntidadHassql,
          cuentaBancariaRecaudo: defecto.cuentaBancariaRecaudo,
        },
      });
    }

    const configEntidad = new ConfiguracionHassql({ ...configRecord });

    // 2. Buscar todas las transacciones aprobadas pendientes de sincronización
    const transaccionesPendientes = await prisma.transaccionPago.findMany({
      where: {
        estadoPago: 'APROBADO',
        sincronizadoHassql: false,
      },
      include: { detalles: true },
      orderBy: { fechaTransaccion: 'asc' },
    });

    // Si no hay pendientes de la sesión, buscamos las aprobadas del día para consolidar lote
    const transaccionesProcesar =
      transaccionesPendientes.length > 0
        ? transaccionesPendientes
        : await prisma.transaccionPago.findMany({
            where: { estadoPago: 'APROBADO' },
            take: 20,
            include: { detalles: true },
            orderBy: { fechaTransaccion: 'desc' },
          });

    if (transaccionesProcesar.length === 0) {
      return {
        exitoso: true,
        codigoLote: 'LOTE-VACIO',
        transaccionesSincronizadas: 0,
        montoTotalSincronizado: 0,
        mensaje: 'No hay transacciones aprobadas pendientes para sincronizar con HASSQL.',
      };
    }

    const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const codigoLote = `SYNC-HSQL-${fechaHoy}-${Math.floor(100 + Math.random() * 900)}`;

    let montoTotal = 0;
    let montoPSE = 0;
    let montoBreB = 0;

    const mapaCuentas: Record<string, { desc: string; total: number; count: number }> = {
      '2.1.2.02.02': { desc: 'Multas y Sanciones de Tránsito (Comparendos SIMIT/CNSV)', total: 0, count: 0 },
      '2.1.1.01': { desc: 'Impuesto Sobre Vehículos Automotores Municipal', total: 0, count: 0 },
      '2.1.2.01': { desc: 'Tasas y Derechos de Tránsito / Rodamiento Municipal', total: 0, count: 0 },
    };

    const movimientos = transaccionesProcesar.map((t) => {
      montoTotal += t.montoTotal;
      if (t.canalPago === 'BRE_B') montoBreB += t.montoTotal;
      else montoPSE += t.montoTotal;

      for (const d of t.detalles) {
        const cta = d.codigoContable || '2.1.2.02.02';
        if (!mapaCuentas[cta]) {
          mapaCuentas[cta] = { desc: d.descripcion, total: 0, count: 0 };
        }
        mapaCuentas[cta].total += d.valorFinal;
        mapaCuentas[cta].count += 1;
      }

      return {
        referenciaPago: t.referenciaPago,
        cus: t.cus || 'CUS-PEND',
        codigoTrazabilidad: t.codigoTrazabilidad || undefined,
        canal: t.canalPago,
        monto: t.montoTotal,
        fechaPago: t.fechaAprobacion?.toISOString() || t.fechaTransaccion.toISOString(),
        conceptos: t.detalles.map((d) => ({
          tipo: d.tipoConcepto,
          referencia: d.referenciaConcepto,
          codigoContable: d.codigoContable,
          valor: d.valorFinal,
        })),
      };
    });

    const imputacionesContables = Object.entries(mapaCuentas)
      .filter(([_, data]) => data.total > 0)
      .map(([codigo, data]) => ({
        codigoContable: codigo,
        descripcionCuenta: data.desc,
        totalCredito: data.total,
        cantidadMovimientos: data.count,
      }));

    const paquete: PaqueteRecaudoHassql = {
      codigoEntidad: configEntidad.codigoEntidadHassql,
      fechaLote: new Date().toISOString(),
      codigoLote,
      cuentaBancaria: configEntidad.cuentaBancariaRecaudo,
      resumen: {
        totalTransacciones: transaccionesProcesar.length,
        montoTotal,
        montoPSE,
        montoBreB,
      },
      imputacionesContables,
      movimientos,
    };

    // 3. Generar Archivo Asobancaria 2001
    const archivoAsobancaria = this.hassqlService.generarArchivoAsobancaria2001(paquete, configEntidad);

    // 4. Transmitir paquete a HASSQL
    const resultadoTransmision = await this.hassqlService.transmitirRecaudoHassql(paquete, configEntidad);

    // 5. Registrar el Lote de Sincronización en la Base de Datos
    await prisma.loteSincronizacionHassql.create({
      data: {
        codigoLote,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        totalTransacciones: transaccionesProcesar.length,
        totalRecaudado: montoTotal,
        totalPSE: montoPSE,
        totalBreB: montoBreB,
        estado: resultadoTransmision.exitoso ? 'EXITOSO' : 'FALLIDO',
        comprobanteHassqlId: resultadoTransmision.comprobanteId,
        respuestaServidor: JSON.stringify(resultadoTransmision.respuestaRaw),
        archivoPlanoGenerado: archivoAsobancaria,
        detallesContables: JSON.stringify(imputacionesContables),
      },
    });

    // 6. Marcar transacciones como sincronizadas
    const idsTransacciones = transaccionesProcesar.map((t) => t.id);
    await prisma.transaccionPago.updateMany({
      where: { id: { in: idsTransacciones } },
      data: {
        sincronizadoHassql: true,
        fechaSincronizacion: new Date(),
        referenciaAsientoHassql: resultadoTransmision.comprobanteId,
      },
    });

    return {
      exitoso: resultadoTransmision.exitoso,
      codigoLote,
      comprobanteHassqlId: resultadoTransmision.comprobanteId,
      transaccionesSincronizadas: transaccionesProcesar.length,
      montoTotalSincronizado: montoTotal,
      mensaje: resultadoTransmision.mensaje,
      archivoAsobancaria,
      detallesContables: imputacionesContables,
    };
  }
}
