import { NextResponse } from 'next/server';
import { PrismaVehiculoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaVehiculoRepository';
import { PrismaCiudadanoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaCiudadanoRepository';
import { TransferirVehiculoUseCase } from '@/application/use-cases/vehiculo/TransferirVehiculoUseCase';
import { VehiculoMapper } from '@/application/mappers/VehiculoMapper';
import { VehiculoConComparendosPendientesException, VehiculoNoEncontradoException } from '@/domain/exceptions/VehiculoExceptions';

const vehiculoRepository = new PrismaVehiculoRepository();
const ciudadanoRepository = new PrismaCiudadanoRepository();

export async function POST(request: Request, { params }: { params: { placa: string } }) {
  try {
    const body = await request.json();
    const useCase = new TransferirVehiculoUseCase(vehiculoRepository, ciudadanoRepository);
    const actualizado = await useCase.execute(params.placa, body);

    return NextResponse.json(VehiculoMapper.toDTO(actualizado));
  } catch (error: any) {
    if (error instanceof VehiculoConComparendosPendientesException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof VehiculoNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error en traspaso de vehículo' }, { status: 400 });
  }
}
