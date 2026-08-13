import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placa = searchParams.get('placa');

    if (placa) {
      const rodamiento = await prisma.rodamientoMunicipal.findFirst({
        where: { placaVehiculo: placa.toUpperCase() },
        orderBy: { vigenciaAnio: 'desc' },
      });
      return NextResponse.json({ data: rodamiento });
    }

    const list = await prisma.rodamientoMunicipal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener rodamiento' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { placaVehiculo, vigenciaAnio, valorTasa } = await req.json();

    if (!placaVehiculo) {
      return NextResponse.json({ error: 'La placa es obligatoria' }, { status: 400 });
    }

    const placaUpper = placaVehiculo.toUpperCase();
    const certRef = `ROD-${placaUpper}-${vigenciaAnio || 2026}`;

    const rod = await prisma.rodamientoMunicipal.create({
      data: {
        placaVehiculo: placaUpper,
        vigenciaAnio: vigenciaAnio || 2026,
        valorTasa: valorTasa || 185000,
        fechaVencimiento: new Date('2026-12-31'),
        estaPazYSalvo: true,
        certificadoRef: certRef,
      },
    });

    return NextResponse.json(rod, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al generar rodamiento' }, { status: 500 });
  }
}
