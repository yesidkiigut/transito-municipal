import { IComparendoRepository } from '../../../domain/ports/outgoing/IComparendoRepository';
import { ResolucionarComparendoDTO, ResolucionarComparendoSchema } from '../../dto/comparendo/ComparendoDTOs';
import { Comparendo } from '../../../domain/entities/Comparendo';
import { ComparendoNoEncontradoException, ComparendoYaResolucionadoException } from '../../../domain/exceptions/ComparendoExceptions';

export class ResolucionarComparendoUseCase {
  constructor(private readonly comparendoRepository: IComparendoRepository) {}

  public async execute(numeroComparendo: string, dto: ResolucionarComparendoDTO): Promise<Comparendo> {
    const validated = ResolucionarComparendoSchema.parse(dto);

    const comparendo = await this.comparendoRepository.findByNumero(numeroComparendo);
    if (!comparendo) {
      throw new ComparendoNoEncontradoException(numeroComparendo);
    }

    if (comparendo.estado === 'FALLADO' || comparendo.estado === 'ARCHIVADO') {
      throw new ComparendoYaResolucionadoException(numeroComparendo);
    }

    comparendo.emitirResolucion(validated.tipo);
    const actualizado = await this.comparendoRepository.update(comparendo);

    await this.comparendoRepository.guardarResolucion({
      comparendoId: comparendo.id,
      numeroResolucion: `RES-${Date.now()}`,
      tipo: validated.tipo,
      motivo: validated.motivo,
      funcionarioId: validated.funcionarioId,
    });

    return actualizado;
  }
}
