import { NextResponse } from 'next/server';
import { PrismaTramiteRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTramiteRepository';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { RadicarTramiteUseCase } from '@/application/use-cases/tramite/RadicarTramiteUseCase';
import { TramiteMapper } from '@/application/mappers/TramiteMapper';

const tramiteRepo = new PrismaTramiteRepository();
const ciudadanoRepo = new PrismaCiudadanoRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new RadicarTramiteUseCase(tramiteRepo, ciudadanoRepo);
    const nuevoTramite = await useCase.execute(body);

    return NextResponse.json(TramiteMapper.toDTO(nuevoTramite), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al radicar trámite' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoTramiteId = searchParams.get('tipoTramiteId') || undefined;
    const ciudadanoSolicitanteId = searchParams.get('ciudadanoId') || undefined;
    const estado = searchParams.get('estado') || undefined;
    const funcionarioAsignadoId = searchParams.get('funcionarioId') || undefined;
    const pagina = searchParams.get('pagina') ? parseInt(searchParams.get('pagina')!) : 1;
    const limite = searchParams.get('limite') ? parseInt(searchParams.get('limite')!) : 10;

    const resultado = await tramiteRepo.findAll({
      tipoTramiteId,
      ciudadanoSolicitanteId,
      estado,
      funcionarioAsignadoId,
      pagina,
      limite,
    });

    return NextResponse.json({
      data: resultado.data.map(t => TramiteMapper.toDTO(t)),
      total: resultado.total,
      pagina: resultado.pagina,
      limite: resultado.limite,
      totalPaginas: resultado.totalPaginas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al listar trámites' }, { status: 500 });
  }
}
