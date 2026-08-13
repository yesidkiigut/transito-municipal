import { NextResponse } from 'next/server';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { RegistrarCiudadanoUseCase } from '@/application/use-cases/ciudadano/RegistrarCiudadanoUseCase';
import { ListarCiudadanosUseCase } from '@/application/use-cases/ciudadano/ListarCiudadanosUseCase';
import { CiudadanoMapper } from '@/application/mappers/CiudadanoMapper';
import { DocumentoYaRegistradoException } from '@/domain/exceptions/CiudadanoExceptions';

const repository = new PrismaCiudadanoRepository();
const mapper = new CiudadanoMapper();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new RegistrarCiudadanoUseCase(repository);
    const ciudadano = await useCase.execute(body);

    return NextResponse.json(mapper.fontToDTO(ciudadano), { status: 201 });
  } catch (error: any) {
    if (error instanceof DocumentoYaRegistradoException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: error?.message || 'Error al registrar ciudadano' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoDocumento = searchParams.get('tipoDocumento') || undefined;
    const estado = searchParams.get('estado') || undefined;
    const busqueda = searchParams.get('busqueda') || undefined;
    const pagina = searchParams.get('pagina') ? parseInt(searchParams.get('pagina')!) : 1;
    const limite = searchParams.get('limite') ? parseInt(searchParams.get('limite')!) : 10;

    const useCase = new ListarCiudadanosUseCase(repository);
    const resultado = await useCase.execute({ tipoDocumento, estado, busqueda, pagina, limite });

    return NextResponse.json({
      data: resultado.data.map(c => mapper.fontToDTO(c)),
      total: resultado.total,
      pagina: resultado.pagina,
      limite: resultado.limite,
      totalPaginas: resultado.totalPaginas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al consultar ciudadanos' }, { status: 500 });
  }
}
