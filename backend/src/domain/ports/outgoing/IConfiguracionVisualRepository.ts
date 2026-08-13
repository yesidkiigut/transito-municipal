import { ConfiguracionVisual } from '../../entities/ConfiguracionVisual';

export interface IConfiguracionVisualRepository {
  obtenerConfiguracion(): Promise<ConfiguracionVisual>;
  guardarConfiguracion(config: ConfiguracionVisual): Promise<ConfiguracionVisual>;
  restablecerConfiguracion(): Promise<ConfiguracionVisual>;
}
