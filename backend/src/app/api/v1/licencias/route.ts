import { NextResponse } from 'next/server';
import { PrismaLicenciaRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLicenciaRepository';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { ExpedirLicenciaNuevaUseCase } from '@/application/use-cases/licencia/ExpedirLicenciaNuevaUseCase';
import { LicenciaMapper } from '@/application/mappers/LicenciaMapper';
import { EdadInsuficienteParaCategoriaException, LicenciaVigenteExistenteException } from '@/domain/exceptions/LicenciaExceptions';

const licenciaRepo = new PrismaLicenciaRepository();
const ciudadanoRepo = new PrismaCiudadanoRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new ExpedirLicenciaNuevaUseCase(licenciaRepo, ciudadanoRepo);
    const nuevaLicencia = await useCase.execute(body);

    return NextResponse.json(LicenciaMapper.toDTO(nuevaLicencia), { status: 201 });
  } catch (error: any) {
    if (error instanceof EdadInsuficienteParaCategoriaException || error instanceof LicenciaVigenteExistenteException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || 'Error al expedir licencia' }, { status: 400 });
  }
}
