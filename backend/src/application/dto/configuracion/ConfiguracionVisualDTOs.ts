import { z } from 'zod';

export const GuardarConfiguracionVisualSchema = z.object({
  nombreMunicipio: z.string().min(2, 'El nombre del municipio es obligatorio'),
  nombreSecretaria: z.string().min(2, 'El nombre del organismo de tránsito es obligatorio'),
  lema: z.string().optional().default(''),
  nitAlcaldia: z.string().min(3, 'El NIT o documento institucional es requerido'),
  logoUrl: z.string().nullable().optional(),
  logoSecundarioUrl: z.string().nullable().optional(),
  escudoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  bannerLoginUrl: z.string().nullable().optional(),
  colorPrimario: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color primario inválido'),
  colorSecundario: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color secundario inválido'),
  colorAcento: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color de acento inválido'),
  colorFondo: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color de fondo inválido'),
  colorSidebar: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color de barra lateral inválido'),
  colorNavbar: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color de barra superior inválido'),
  colorTexto: z.string().optional().default('#f8fafc'),
  modoOscuro: z.boolean().default(true),
  estiloBorde: z.string().default('rounded-2xl'),
  fuentePrincipal: z.string().default('Outfit'),
  presetTema: z.string().default('CYAN_MODERN'),
  telefonoContacto: z.string().default(''),
  correoContacto: z.string().email('Correo de contacto inválido').or(z.literal('')).default(''),
  direccionSede: z.string().default(''),
  textoPiePagina: z.string().default(''),
  portalWebUrl: z.string().default(''),
  redesSociales: z.string().nullable().optional(),
});

export type GuardarConfiguracionVisualInput = z.infer<typeof GuardarConfiguracionVisualSchema>;

export interface ConfiguracionVisualResponseDTO {
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
  activo: boolean;
  updatedAt?: string;
}
