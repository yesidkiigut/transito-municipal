import { NextResponse } from 'next/server';
import { PrismaLicenciaRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLicenciaRepository';
import { ConsultarLicenciaPorNumeroUseCase } from '@/application/use-cases/licencia/ConsultarLicenciaPorNumeroUseCase';
import { RenovarLicenciaUseCase } from '@/application/use-cases/licencia/RenovarLicenciaUseCase';
import { LicenciaMapper } from '@/application/mappers/LicenciaMapper';
import { LicenciaNoEncontradaException } from '@/domain/exceptions/LicenciaExceptions';

const licenciaRepo = new PrismaLicenciaRepository();

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const useCase = new ConsultarLicenciaPorNumeroUseCase(licenciaRepo);
    const licencia = await useCase.execute(params.numero);
    return NextResponse.json(LicenciaMapper.toDTO(licencia));
  } catch (error: any) {
    if (error instanceof LicenciaNoEncontradaException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al obtener licencia' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { numero: string } }) {
  try {
    const useCase = new RenovarLicenciaUseCase(licenciaRepo);
    const renovada = await useCase.execute(params.numero);
    return NextResponse.json(LicenciaMapper.toDTO(renovada));
  } catch (error: any) {
    if (error instanceof LicenciaNoEncontradaException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al renovar licencia' }, { status: 400 });
  }
}
