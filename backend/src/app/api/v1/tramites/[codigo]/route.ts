import { NextResponse } from 'next/server';
import { PrismaTramiteRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTramiteRepository';
import { ConsultarTramiteUseCase } from '@/application/use-cases/tramite/ConsultarTramiteUseCase';
import { TramiteMapper } from '@/application/mappers/TramiteMapper';
import { TramiteNoEncontradoException } from '@/domain/exceptions/TramiteExceptions';

const tramiteRepo = new PrismaTramiteRepository();

export async function GET(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const useCase = new ConsultarTramiteUseCase(tramiteRepo);
    const tramite = await useCase.execute(params.codigo);
    return NextResponse.json(TramiteMapper.toDTO(tramite));
  } catch (error: any) {
    if (error instanceof TramiteNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al obtener trámite' }, { status: 500 });
  }
}
