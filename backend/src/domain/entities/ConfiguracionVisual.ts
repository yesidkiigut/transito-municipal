export interface ConfiguracionVisualProps {
  id?: string;
  nombreMunicipio: string;
  nombreSecretaria: string;
  lema: string;
  nitAlcaldia: string;
  logoUrl?: string | null;
  logoSecundarioUrl?: string | null;
  escudoUrl?: string | null;
  faviconUrl?: string | null;
  bannerLoginUrl?: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  colorFondo: string;
  colorSidebar: string;
  colorNavbar: string;
  colorTexto: string;
  modoOscuro: boolean;
  estiloBorde: string;
  fuentePrincipal: string;
  presetTema: string;
  telefonoContacto: string;
  correoContacto: string;
  direccionSede: string;
  textoPiePagina: string;
  portalWebUrl: string;
  redesSociales?: string | null;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ConfiguracionVisual {
  public readonly id?: string;
  public readonly nombreMunicipio: string;
  public readonly nombreSecretaria: string;
  public readonly lema: string;
  public readonly nitAlcaldia: string;
  public readonly logoUrl?: string | null;
  public readonly logoSecundarioUrl?: string | null;
  public readonly escudoUrl?: string | null;
  public readonly faviconUrl?: string | null;
  public readonly bannerLoginUrl?: string | null;
  public readonly colorPrimario: string;
  public readonly colorSecundario: string;
  public readonly colorAcento: string;
  public readonly colorFondo: string;
  public readonly colorSidebar: string;
  public readonly colorNavbar: string;
  public readonly colorTexto: string;
  public readonly modoOscuro: boolean;
  public readonly estiloBorde: string;
  public readonly fuentePrincipal: string;
  public readonly presetTema: string;
  public readonly telefonoContacto: string;
  public readonly correoContacto: string;
  public readonly direccionSede: string;
  public readonly textoPiePagina: string;
  public readonly portalWebUrl: string;
  public readonly redesSociales?: string | null;
  public readonly activo: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ConfiguracionVisualProps) {
    this.id = props.id;
    this.nombreMunicipio = props.nombreMunicipio || 'Municipio de Ejemplo';
    this.nombreSecretaria = props.nombreSecretaria || 'Secretaría de Tránsito y Transporte';
    this.lema = props.lema || 'Movilidad Segura, Eficiente e Innovadora';
    this.nitAlcaldia = props.nitAlcaldia || '899.999.001-3';
    this.logoUrl = props.logoUrl;
    this.logoSecundarioUrl = props.logoSecundarioUrl;
    this.escudoUrl = props.escudoUrl;
    this.faviconUrl = props.faviconUrl;
    this.bannerLoginUrl = props.bannerLoginUrl;
    this.colorPrimario = props.colorPrimario || '#06b6d4';
    this.colorSecundario = props.colorSecundario || '#2563eb';
    this.colorAcento = props.colorAcento || '#4f46e5';
    this.colorFondo = props.colorFondo || '#020617';
    this.colorSidebar = props.colorSidebar || '#0f172a';
    this.colorNavbar = props.colorNavbar || '#0f172a';
    this.colorTexto = props.colorTexto || '#f8fafc';
    this.modoOscuro = props.modoOscuro ?? true;
    this.estiloBorde = props.estiloBorde || 'rounded-2xl';
    this.fuentePrincipal = props.fuentePrincipal || 'Outfit';
    this.presetTema = props.presetTema || 'CYAN_MODERN';
    this.telefonoContacto = props.telefonoContacto || '+57 (601) 555-0199';
    this.correoContacto = props.correoContacto || 'contacto@transitomunicipal.gov.co';
    this.direccionSede = props.direccionSede || 'Palacio Municipal - Cra 5 # 10-20';
    this.textoPiePagina = props.textoPiePagina || '© 2026 Alcaldía Municipal - Secretaría de Tránsito. Todos los derechos reservados.';
    this.portalWebUrl = props.portalWebUrl || 'https://transitomunicipal.gov.co';
    this.redesSociales = props.redesSociales;
    this.activo = props.activo ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static crearDefecto(): ConfiguracionVisual {
    return new ConfiguracionVisual({
      nombreMunicipio: 'Alcaldía Municipal de San Mateo',
      nombreSecretaria: 'Secretaría de Tránsito y Movilidad',
      lema: 'Hacia un Tránsito Digital, Seguro y Eficiente',
      nitAlcaldia: '890.123.456-7',
      logoUrl: '',
      logoSecundarioUrl: '',
      escudoUrl: '',
      faviconUrl: '',
      bannerLoginUrl: '',
      colorPrimario: '#06b6d4', // Cyan 500
      colorSecundario: '#2563eb', // Blue 600
      colorAcento: '#4f46e5', // Indigo 600
      colorFondo: '#020617', // Slate 950
      colorSidebar: '#0f172a', // Slate 900
      colorNavbar: '#0f172a',
      colorTexto: '#f8fafc',
      modoOscuro: true,
      estiloBorde: 'rounded-2xl',
      fuentePrincipal: 'Outfit',
      presetTema: 'CYAN_MODERN',
      telefonoContacto: '+57 (601) 745-8900',
      correoContacto: 'contacto@transitomodelo.gov.co',
      direccionSede: 'Palacio Municipal, Carrera 7 # 12-40',
      textoPiePagina: '© 2026 Alcaldía Municipal - Secretaría de Tránsito. Vigilado Supertransporte & MinTransporte.',
      portalWebUrl: 'https://transitomodelo.gov.co',
      redesSociales: JSON.stringify({
        facebook: 'https://facebook.com/transitomunicipal',
        twitter: 'https://twitter.com/transitomunicipal',
        instagram: 'https://instagram.com/transitomunicipal',
        youtube: 'https://youtube.com/transitomunicipal'
      }),
      activo: true
    });
  }
}
