import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';

export async function GET() {
  try {
    const list = await prisma.preinscripcion.findMany({
      include: { ciudadano: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener preinscripciones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.ciudadanoId || !body.tipoTramiteCodigo) {
      return NextResponse.json({ error: 'El ciudadano y el trámite son obligatorios' }, { status: 400 });
    }

    const codigo = `PRE-${Date.now().toString().slice(-6)}`;

    const pre = await prisma.preinscripcion.create({
      data: {
        codigoPreinscripcion: codigo,
        ciudadanoId: body.ciudadanoId,
        tipoTramiteCodigo: body.tipoTramiteCodigo,
        placaVehiculo: body.placaVehiculo ? body.placaVehiculo.toUpperCase() : null,
        datosFormulario: JSON.stringify(body.datos || {}),
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json(pre, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al guardar preinscripción' }, { status: 500 });
  }
}
