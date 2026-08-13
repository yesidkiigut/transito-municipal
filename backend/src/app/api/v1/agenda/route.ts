import { NextResponse } from 'next/server';
import { PrismaCitaRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCitaRepository';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { ReservarCitaUseCase } from '@/application/use-cases/agenda/ReservarCitaUseCase';
import { CitaMapper } from '@/application/mappers/CitaMapper';
import { CitaActivaExistenteException } from '@/domain/exceptions/CitaExceptions';

const citaRepo = new PrismaCitaRepository();
const ciudadanoRepo = new PrismaCiudadanoRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new ReservarCitaUseCase(citaRepo, ciudadanoRepo);
    const nuevaCita = await useCase.execute(body);

    return NextResponse.json(CitaMapper.toDTO(nuevaCita), { status: 201 });
  } catch (error: any) {
    if (error instanceof CitaActivaExistenteException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || 'Error al reservar cita' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ciudadanoId = searchParams.get('ciudadanoId') || undefined;
    const puestoAtencionId = searchParams.get('puestoAtencionId') || undefined;
    const estado = searchParams.get('estado') || undefined;

    const citas = await citaRepo.findAll({ ciudadanoId, puestoAtencionId, estado });
    return NextResponse.json({ data: citas.map(c => CitaMapper.toDTO(c)) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al listar citas' }, { status: 500 });
  }
}
