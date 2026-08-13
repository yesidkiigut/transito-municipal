import { NextResponse } from 'next/server';
import { PrismaComparendoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaComparendoRepository';
import { PrismaLicenciaRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLicenciaRepository';
import { ImponerComparendoUseCase } from '@/application/use-cases/comparendo/ImponerComparendoUseCase';
import { ComparendoMapper } from '@/application/mappers/ComparendoMapper';

const comparendoRepo = new PrismaComparendoRepository();
const licenciaRepo = new PrismaLicenciaRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new ImponerComparendoUseCase(comparendoRepo, licenciaRepo);
    const comparendo = await useCase.execute(body);

    return NextResponse.json(ComparendoMapper.toDTO(comparendo), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al imponer comparendo' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placaVehiculo = searchParams.get('placa') || undefined;
    const ciudadanoId = searchParams.get('ciudadanoId') || undefined;
    const estado = searchParams.get('estado') || undefined;
    const pagina = searchParams.get('pagina') ? parseInt(searchParams.get('pagina')!) : 1;
    const limite = searchParams.get('limite') ? parseInt(searchParams.get('limite')!) : 10;

    const resultado = await comparendoRepo.findAll({ placaVehiculo, ciudadanoId, estado, pagina, limite });

    return NextResponse.json({
      data: resultado.data.map(c => ComparendoMapper.toDTO(c)),
      total: resultado.total,
      pagina: resultado.pagina,
      limite: resultado.limite,
      totalPaginas: resultado.totalPaginas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al consultar comparendos' }, { status: 500 });
  }
}
