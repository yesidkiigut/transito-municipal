import { NextResponse } from 'next/server';
import { PrismaVehiculoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaVehiculoRepository';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { RegistrarVehiculoUseCase } from '@/application/use-cases/vehiculo/RegistrarVehiculoUseCase';
import { VehiculoMapper } from '@/application/mappers/VehiculoMapper';
import { PlacaYaRegistradaException } from '@/domain/exceptions/VehiculoExceptions';

const vehiculoRepository = new PrismaVehiculoRepository();
const ciudadanoRepository = new PrismaCiudadanoRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new RegistrarVehiculoUseCase(vehiculoRepository, ciudadanoRepository);
    const vehiculo = await useCase.execute(body);

    return NextResponse.json(VehiculoMapper.toDTO(vehiculo), { status: 201 });
  } catch (error: any) {
    if (error instanceof PlacaYaRegistradaException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || 'Error al matricular vehículo' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoVehiculo = searchParams.get('tipoVehiculo') || undefined;
    const claseServicio = searchParams.get('claseServicio') || undefined;
    const busqueda = searchParams.get('busqueda') || undefined;
    const pagina = searchParams.get('pagina') ? parseInt(searchParams.get('pagina')!) : 1;
    const limite = searchParams.get('limite') ? parseInt(searchParams.get('limite')!) : 10;

    const resultado = await vehiculoRepository.findAll({ tipoVehiculo, claseServicio, busqueda, pagina, limite });

    return NextResponse.json({
      data: resultado.data.map(v => VehiculoMapper.toDTO(v)),
      total: resultado.total,
      pagina: resultado.pagina,
      limite: resultado.limite,
      totalPaginas: resultado.totalPaginas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al listar vehículos' }, { status: 500 });
  }
}
