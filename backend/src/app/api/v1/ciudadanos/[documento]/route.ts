import { NextResponse } from 'next/server';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { ConsultarCiudadanoPorDocumentoUseCase } from '@/application/use-cases/ciudadano/ConsultarCiudadanoPorDocumentoUseCase';
import { ActualizarDatosCiudadanoUseCase } from '@/application/use-cases/ciudadano/ActualizarDatosCiudadanoUseCase';
import { CiudadanoMapper } from '@/application/mappers/CiudadanoMapper';
import { CiudadanoNoEncontradoException } from '@/domain/exceptions/CiudadanoExceptions';

const repository = new PrismaCiudadanoRepository();
const mapper = new CiudadanoMapper();

export async function GET(request: Request, { params }: { params: { documento: string } }) {
  try {
    const useCase = new ConsultarCiudadanoPorDocumentoUseCase(repository);
    const ciudadano = await useCase.execute(params.documento);
    return NextResponse.json(mapper.fontToDTO(ciudadano));
  } catch (error: any) {
    if (error instanceof CiudadanoNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al obtener ciudadano' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { documento: string } }) {
  try {
    const body = await request.json();
    const useCase = new ActualizarDatosCiudadanoUseCase(repository);
    const actualizado = await useCase.execute(params.documento, body);
    return NextResponse.json(mapper.fontToDTO(actualizado));
  } catch (error: any) {
    if (error instanceof CiudadanoNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al actualizar ciudadano' }, { status: 400 });
  }
}
