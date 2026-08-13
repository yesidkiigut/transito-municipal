import { NextResponse } from 'next/server';
import { PrismaTramiteRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTramiteRepository';
import { AvanzarPasoTramiteUseCase } from '@/application/use-cases/tramite/AvanzarPasoTramiteUseCase';
import { TramiteMapper } from '@/application/mappers/TramiteMapper';
import { TransicionWorkflowInvalidaException, TramiteNoEncontradoException } from '@/domain/exceptions/TramiteExceptions';

const tramiteRepo = new PrismaTramiteRepository();

export async function POST(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const body = await request.json();
    const useCase = new AvanzarPasoTramiteUseCase(tramiteRepo);
    const actualizado = await useCase.execute(params.codigo, body);

    return NextResponse.json(TramiteMapper.toDTO(actualizado));
  } catch (error: any) {
    if (error instanceof TransicionWorkflowInvalidaException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof TramiteNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al avanzar en el flujo del trámite' }, { status: 400 });
  }
}
