import { NextResponse } from 'next/server';
import { PrismaCitaRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCitaRepository';
import { CancelarCitaUseCase } from '@/application/use-cases/agenda/CancelarCitaUseCase';
import { CitaMapper } from '@/application/mappers/CitaMapper';
import { CancelacionCitaTardiaException, CitaNoEncontradaException } from '@/domain/exceptions/CitaExceptions';

const citaRepo = new PrismaCitaRepository();

export async function POST(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const useCase = new CancelarCitaUseCase(citaRepo);
    const cancelada = await useCase.execute(params.codigo);

    return NextResponse.json(CitaMapper.toDTO(cancelada));
  } catch (error: any) {
    if (error instanceof CancelacionCitaTardiaException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof CitaNoEncontradaException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al cancelar cita' }, { status: 400 });
  }
}
