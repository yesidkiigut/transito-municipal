import { NextResponse } from 'next/server';
import { PrismaVehiculoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaVehiculoRepository';
import { ConsultarVehiculoPorPlacaUseCase } from '@/application/use-cases/vehiculo/ConsultarVehiculoPorPlacaUseCase';
import { VehiculoMapper } from '@/application/mappers/VehiculoMapper';
import { VehiculoNoEncontradoException } from '@/domain/exceptions/VehiculoExceptions';

const vehiculoRepository = new PrismaVehiculoRepository();

export async function GET(request: Request, { params }: { params: { placa: string } }) {
  try {
    const useCase = new ConsultarVehiculoPorPlacaUseCase(vehiculoRepository);
    const vehiculo = await useCase.execute(params.placa);
    return NextResponse.json(VehiculoMapper.toDTO(vehiculo));
  } catch (error: any) {
    if (error instanceof VehiculoNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al consultar vehículo' }, { status: 500 });
  }
}
