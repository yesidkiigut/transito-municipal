import { ICiudadanoRepository, FiltrosListarCiudadanos, ResultadoPaginado } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { Ciudadano } from '../../../domain/entities/Ciudadano';

export class ListarCiudadanosUseCase {
  constructor(private readonly ciudadanoRepository: ICiudadanoRepository) {}

  public async execute(filtros: FiltrosListarCiudadanos): Promise<ResultadoPaginado<Ciudadano>> {
    const pagina = Math.max(1, filtros.pagina || 1);
    const limite = Math.max(1, Math.min(100, filtros.limite || 10));

    return await this.ciudadanoRepository.findAll({
      ...filtros,
      pagina,
      limite,
    });
  }
}
