import { NextResponse } from 'next/server';
import { PrismaCitaRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCitaRepository';
import { AtenderCitaUseCase } from '@/application/use-cases/agenda/AtenderCitaUseCase';
import { CitaMapper } from '@/application/mappers/CitaMapper';
import { CitaNoEncontradaException } from '@/domain/exceptions/CitaExceptions';

const citaRepo = new PrismaCitaRepository();

export async function POST(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const useCase = new AtenderCitaUseCase(citaRepo);
    const atendida = await useCase.execute(params.codigo);

    return NextResponse.json(CitaMapper.toDTO(atendida));
  } catch (error: any) {
    if (error instanceof CitaNoEncontradaException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al atender cita' }, { status: 400 });
  }
}
