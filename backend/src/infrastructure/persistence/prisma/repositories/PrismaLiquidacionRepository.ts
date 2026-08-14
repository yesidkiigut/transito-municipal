import { prisma } from '../client';
import {
  ILiquidacionRepository,
  ComparendoLiquidadoResult,
  ImpuestoVehicularLiquidadoResult,
  CuotaSimuladaResult,
  EstadoCuentaMensualResult,
  CrearAcuerdoParams,
} from '../../../../domain/ports/outgoing/ILiquidacionRepository';

export class PrismaLiquidacionRepository implements ILiquidacionRepository {
  public async liquidarComparendo(
    comparendoId: string,
    fechaCorte?: Date,
    realizoCurso: boolean = false
  ): Promise<ComparendoLiquidadoResult> {
    const fechaCorteStr = fechaCorte ? fechaCorte.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const result = await prisma.$queryRaw<Array<{ res: any }>>`
      SELECT fn_liquidar_comparendo(${comparendoId}, ${fechaCorteStr}::DATE, ${realizoCurso}) as res
    `;

    if (!result || result.length === 0 || !result[0].res) {
      throw new Error(`No fue posible liquidar el comparendo con ID ${comparendoId}`);
    }

    return result[0].res as ComparendoLiquidadoResult;
  }

  public async liquidarImpuestoVehicular(
    placa: string,
    vigencia: number,
    fechaCorte?: Date,
    aplicaTraslado: boolean = false
  ): Promise<ImpuestoVehicularLiquidadoResult> {
    const fechaCorteStr = fechaCorte ? fechaCorte.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const result = await prisma.$queryRaw<Array<{ res: any }>>`
      SELECT fn_liquidar_impuesto_vehicular(${placa.toUpperCase()}, ${vigencia}, ${fechaCorteStr}::DATE, ${aplicaTraslado}) as res
    `;

    if (!result || result.length === 0 || !result[0].res) {
      throw new Error(`No fue posible liquidar el impuesto vehicular para la placa ${placa}`);
    }

    return result[0].res as ImpuestoVehicularLiquidadoResult;
  }

  public async simularAcuerdoPago(
    montoTotal: number,
    porcentajeInicial: number = 20.0,
    numeroCuotas: number = 6,
    tasaInteres: number = 1.2,
    fechaInicio?: Date
  ): Promise<CuotaSimuladaResult[]> {
    const fechaInicioStr = fechaInicio ? fechaInicio.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const rows = await prisma.$queryRaw<Array<CuotaSimuladaResult>>`
      SELECT 
        numero_cuota,
        TO_CHAR(fecha_vencimiento, 'YYYY-MM-DD') as fecha_vencimiento,
        valor_capital::FLOAT as valor_capital,
        valor_interes::FLOAT as valor_interes,
        valor_total_cuota::FLOAT as valor_total_cuota,
        saldo_restante::FLOAT as saldo_restante
      FROM fn_simular_acuerdo_pago(
        ${montoTotal}::NUMERIC,
        ${porcentajeInicial}::NUMERIC,
        ${numeroCuotas}::INT,
        ${tasaInteres}::NUMERIC,
        ${fechaInicioStr}::DATE
      )
    `;

    return rows;
  }

  public async crearAcuerdoPagoTransaccional(params: CrearAcuerdoParams): Promise<any> {
    const detallesJson = JSON.stringify(params.detallesDeuda || []);
    const tasa = params.tasaInteres ?? 1.2;

    const result = await prisma.$queryRaw<Array<{ res: any }>>`
      SELECT fn_crear_acuerdo_pago_transaccional(
        ${params.ciudadanoId},
        ${params.placa ? params.placa.toUpperCase() : ''},
        ${params.montoTotal}::NUMERIC,
        ${params.porcentajeInicial}::NUMERIC,
        ${params.numeroCuotas}::INT,
        ${tasa}::NUMERIC,
        ${detallesJson}::JSONB,
        ${params.funcionarioId || null}
      ) as res
    `;

    if (!result || result.length === 0 || !result[0].res) {
      throw new Error('Error al registrar el acuerdo de pago transaccional en la base de datos.');
    }

    return result[0].res;
  }

  public async obtenerEstadoCuentaMensual(
    ciudadanoId?: string,
    placa?: string,
    mesesHistoria: number = 12
  ): Promise<EstadoCuentaMensualResult> {
    const result = await prisma.$queryRaw<Array<{ res: any }>>`
      SELECT fn_obtener_estado_cuenta_mensual(
        ${ciudadanoId || null},
        ${placa ? placa.toUpperCase() : null},
        ${mesesHistoria}::INT
      ) as res
    `;

    if (!result || result.length === 0 || !result[0].res) {
      throw new Error('No se pudo generar el estado de cuenta mensual.');
    }

    return result[0].res as EstadoCuentaMensualResult;
  }

  public async calcularTramosDescuento(
    tipoConcepto: string,
    referenciaId: string,
    fechaCorte?: Date,
    realizoCurso: boolean = false
  ): Promise<any> {
    const fechaCorteStr = fechaCorte ? fechaCorte.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const result = await prisma.$queryRaw<Array<{ res: any }>>`
      SELECT fn_calcular_tramos_descuento(
        ${tipoConcepto.toUpperCase()},
        ${referenciaId},
        ${fechaCorteStr}::DATE,
        ${realizoCurso}
      ) as res
    `;

    if (!result || result.length === 0 || !result[0].res) {
      throw new Error('Error al calcular los tramos de descuento y beneficios.');
    }

    return result[0].res;
  }
}
