import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';
import { ImpuestoVehicular } from '@/domain/entities/ImpuestoVehicular';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placa = searchParams.get('placa');

    if (!placa) {
      return NextResponse.json({ error: 'La placa es obligatoria' }, { status: 400 });
    }

    const placaUpper = placa.toUpperCase();

    // Buscar vehículo en base de datos
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { placa: placaUpper },
      include: {
        propietarios: {
          where: { esActual: true },
          include: { ciudadano: true },
        },
      },
    });

    if (!vehiculo) {
      return NextResponse.json({ error: `El vehículo con placa ${placaUpper} no existe en el RUNT municipal` }, { status: 404 });
    }

    // Buscar o calcular liquidación de impuesto vehicular vigente (2026)
    let impuestoRecord = await prisma.impuestoVehicular.findFirst({
      where: { placaVehiculo: placaUpper, vigenciaFiscal: 2026 },
    });

    // Si no existe, creamos la liquidación de ejemplo para el avalúo del vehículo
    if (!impuestoRecord) {
      const avaluoEstimado = (vehiculo.modelo >= 2022 ? 65000000 : 35000000) + (vehiculo.cilindraje * 1000);
      const fechaVenc = new Date('2026-05-31');

      const impuestoEntidad = new ImpuestoVehicular({
        placaVehiculo: placaUpper,
        vigenciaFiscal: 2026,
        avaluoComercial: avaluoEstimado,
        fechaVencimiento: fechaVenc,
      });

      // Recalcular mora/descuento al día actual
      impuestoEntidad.recalcularLiquidacion(new Date(), true, false);

      impuestoRecord = await prisma.impuestoVehicular.create({
        data: {
          placaVehiculo: placaUpper,
          vigenciaFiscal: 2026,
          avaluoComercial: impuestoEntidad.avaluoComercial,
          valorBaseImpuesto: impuestoEntidad.valorBaseImpuesto,
          sancionMora: impuestoEntidad.sancionMora,
          interesesMora: impuestoEntidad.interesesMora,
          descuentoProntoPago: impuestoEntidad.descuentoProntoPago,
          valorTotalPagar: impuestoEntidad.valorTotalPagar,
          estado: impuestoEntidad.estado,
          fechaVencimiento: impuestoEntidad.fechaVencimiento,
        },
      });
    }

    const propietarioActual = vehiculo.propietarios[0]?.ciudadano;

    return NextResponse.json({
      vehiculo: {
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        linea: vehiculo.linea,
        modelo: vehiculo.modelo,
        cilindraje: vehiculo.cilindraje,
        claseServicio: vehiculo.claseServicio,
        propietario: propietarioActual ? `${propietarioActual.nombres} ${propietarioActual.apellidos} (${propietarioActual.numeroDocumento})` : 'Sin propietario',
      },
      liquidaciones: [
        {
          id: impuestoRecord.id,
          vigenciaFiscal: impuestoRecord.vigenciaFiscal,
          avaluoComercial: impuestoRecord.avaluoComercial,
          valorBaseImpuesto: impuestoRecord.valorBaseImpuesto,
          sancionMora: impuestoRecord.sancionMora,
          interesesMora: impuestoRecord.interesesMora,
          descuentoProntoPago: impuestoRecord.descuentoProntoPago,
          valorTotalPagar: impuestoRecord.valorTotalPagar,
          estado: impuestoRecord.estado,
          fechaVencimiento: impuestoRecord.fechaVencimiento.toISOString().split('T')[0],
          fechaPago: impuestoRecord.fechaPago ? impuestoRecord.fechaPago.toISOString().split('T')[0] : null,
          reciboPagoRef: impuestoRecord.reciboPagoRef,
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al consultar impuesto vehicular' }, { status: 500 });
  }
}
