import { IConfiguracionVisualRepository } from '../../../domain/ports/outgoing/IConfiguracionVisualRepository';
import { ConfiguracionVisual } from '../../../domain/entities/ConfiguracionVisual';
import { GuardarConfiguracionVisualInput, ConfiguracionVisualResponseDTO } from '../../dto/configuracion/ConfiguracionVisualDTOs';
import { ConfiguracionVisualMapper } from '../../mappers/ConfiguracionVisualMapper';

export class GuardarConfiguracionVisualUseCase {
  constructor(private readonly repo: IConfiguracionVisualRepository) {}

  public async execute(input: GuardarConfiguracionVisualInput): Promise<ConfiguracionVisualResponseDTO> {
    const entidad = new ConfiguracionVisual({
      nombreMunicipio: input.nombreMunicipio,
      nombreSecretaria: input.nombreSecretaria,
      lema: input.lema || '',
      nitAlcaldia: input.nitAlcaldia,
      logoUrl: input.logoUrl,
      logoSecundarioUrl: input.logoSecundarioUrl,
      escudoUrl: input.escudoUrl,
      faviconUrl: input.faviconUrl,
      bannerLoginUrl: input.bannerLoginUrl,
      colorPrimario: input.colorPrimario,
      colorSecundario: input.colorSecundario,
      colorAcento: input.colorAcento,
      colorFondo: input.colorFondo,
      colorSidebar: input.colorSidebar,
      colorNavbar: input.colorNavbar,
      colorTexto: input.colorTexto || '#f8fafc',
      modoOscuro: input.modoOscuro ?? true,
      estiloBorde: input.estiloBorde || 'rounded-2xl',
      fuentePrincipal: input.fuentePrincipal || 'Outfit',
      presetTema: input.presetTema || 'CYAN_MODERN',
      telefonoContacto: input.telefonoContacto || '',
      correoContacto: input.correoContacto || '',
      direccionSede: input.direccionSede || '',
      textoPiePagina: input.textoPiePagina || '',
      portalWebUrl: input.portalWebUrl || '',
      redesSociales: input.redesSociales,
      activo: true,
    });

    const guardado = await this.repo.guardarConfiguracion(entidad);
    return ConfiguracionVisualMapper.toDTO(guardado);
  }
}
