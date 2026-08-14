import { NextRequest, NextResponse } from 'next/server';
import { GestionarReglasDescuentoUseCase } from '@/application/use-cases/beneficios/GestionarParametrosUseCase';

const useCase = new GestionarReglasDescuentoUseCase();

export async function GET() {
  try {
    const reglas = await useCase.listarReglas();
    return NextResponse.json({ data: reglas }, { status: 200 });
  } catch (error: any) {
    console.error('Error al listar reglas de descuento:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al listar reglas de descuento.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const regla = await useCase.crearOActualizarRegla(body);
    return NextResponse.json(regla, { status: 201 });
  } catch (error: any) {
    console.error('Error al guardar regla de descuento:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al guardar regla de descuento.' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, activo } = body;
    if (!id || typeof activo !== 'boolean') {
      return NextResponse.json({ error: 'Parámetros id y activo son obligatorios.' }, { status: 400 });
    }
    const regla = await useCase.toggleReglaActiva(id, activo);
    return NextResponse.json(regla, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al actualizar estado.' }, { status: 400 });
  }
}
