import { IComparendoRepository } from '../../../domain/ports/outgoing/IComparendoRepository';
import { Comparendo } from '../../../domain/entities/Comparendo';
import { ComparendoNoEncontradoException } from '../../../domain/exceptions/ComparendoExceptions';

export class ConsultarComparendoUseCase {
  constructor(private readonly comparendoRepository: IComparendoRepository) {}

  public async execute(numeroComparendo: string): Promise<Comparendo> {
    const comparendo = await this.comparendoRepository.findByNumero(numeroComparendo);
    if (!comparendo) {
      throw new ComparendoNoEncontradoException(numeroComparendo);
    }
    return comparendo;
  }
}
