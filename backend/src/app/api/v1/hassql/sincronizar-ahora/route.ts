import { NextResponse } from 'next/server';
import { SincronizarLoteDiarioHassqlUseCase } from '@/application/use-cases/hassql/SincronizarLoteDiarioHassqlUseCase';

const sincronizarUseCase = new SincronizarLoteDiarioHassqlUseCase();

export async function POST() {
  try {
    const resultado = await sincronizarUseCase.execute();
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al ejecutar sincronización contable con HASSQL' },
      { status: 500 }
    );
  }
}
