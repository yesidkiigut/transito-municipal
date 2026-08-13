import { IConfiguracionVisualRepository } from '../../../domain/ports/outgoing/IConfiguracionVisualRepository';
import { ConfiguracionVisualResponseDTO } from '../../dto/configuracion/ConfiguracionVisualDTOs';
import { ConfiguracionVisualMapper } from '../../mappers/ConfiguracionVisualMapper';

export class RestablecerConfiguracionVisualUseCase {
  constructor(private readonly repo: IConfiguracionVisualRepository) {}

  public async execute(): Promise<ConfiguracionVisualResponseDTO> {
    const config = await this.repo.restablecerConfiguracion();
    return ConfiguracionVisualMapper.toDTO(config);
  }
}
