import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';

export interface ThemeConfig {
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
}

export interface PresetTema {
  id: string;
  nombre: string;
  descripcion: string;
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
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  nombreMunicipio: 'Alcaldía Municipal de San Mateo',
  nombreSecretaria: 'Secretaría de Tránsito y Movilidad',
  lema: 'Hacia un Tránsito Digital, Seguro y Eficiente',
  nitAlcaldia: '890.123.456-7',
  logoUrl: '',
  logoSecundarioUrl: '',
  escudoUrl: '',
  faviconUrl: '',
  bannerLoginUrl: '',
  colorPrimario: '#06b6d4',
  colorSecundario: '#2563eb',
  colorAcento: '#4f46e5',
  colorFondo: '#020617',
  colorSidebar: '#0f172a',
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
  activo: true,
};

interface ThemeState {
  config: ThemeConfig;
  previewConfig: ThemeConfig | null;
  presets: PresetTema[];
  loading: boolean;
  saving: boolean;
  fetchConfig: () => Promise<void>;
  fetchPresets: () => Promise<void>;
  saveConfig: (newConfig: Partial<ThemeConfig>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  setPreview: (tempConfig: ThemeConfig | null) => void;
  applyPreset: (preset: PresetTema) => void;
  applyThemeToDOM: (config: ThemeConfig) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  config: DEFAULT_THEME_CONFIG,
  previewConfig: null,
  presets: [],
  loading: false,
  saving: false,

  applyThemeToDOM: (config: ThemeConfig) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply CSS Variables
    root.style.setProperty('--color-primary', config.colorPrimario);
    root.style.setProperty('--color-secondary', config.colorSecundario);
    root.style.setProperty('--color-accent', config.colorAcento);
    root.style.setProperty('--color-bg', config.colorFondo);
    root.style.setProperty('--color-sidebar', config.colorSidebar);
    root.style.setProperty('--color-navbar', config.colorNavbar);
    root.style.setProperty('--color-text', config.colorTexto || '#f8fafc');

    // Apply font family
    if (config.fuentePrincipal) {
      document.body.style.fontFamily = `'${config.fuentePrincipal}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    }

    // Dynamic document title
    if (config.nombreSecretaria && config.nombreMunicipio) {
      document.title = `${config.nombreSecretaria} | ${config.nombreMunicipio}`;
    }

    // Dynamic favicon if available
    if (config.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = config.faviconUrl;
    }
  },

  fetchConfig: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/api/v1/configuracion-visual');
      if (res.data) {
        const fullConfig = { ...DEFAULT_THEME_CONFIG, ...res.data };
        set({ config: fullConfig });
        get().applyThemeToDOM(fullConfig);
      }
    } catch (err) {
      console.warn('Usando configuración visual predeterminada local');
      get().applyThemeToDOM(DEFAULT_THEME_CONFIG);
    } finally {
      set({ loading: false });
    }
  },

  fetchPresets: async () => {
    try {
      const res = await axios.get('/api/v1/configuracion-visual/presets');
      if (res.data && Array.isArray(res.data)) {
        set({ presets: res.data });
      }
    } catch (err) {
      console.error('Error al cargar presets de temas');
    }
  },

  saveConfig: async (newConfigData: Partial<ThemeConfig>) => {
    set({ saving: true });
    try {
      const merged = { ...get().config, ...newConfigData };
      const res = await axios.post('/api/v1/configuracion-visual', merged);
      if (res.data) {
        const updated = { ...DEFAULT_THEME_CONFIG, ...res.data };
        set({ config: updated, previewConfig: null });
        get().applyThemeToDOM(updated);
        toast.success('¡Identidad visual y colores institucionales guardados correctamente!');
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al guardar la personalización visual';
      toast.error(errorMsg);
      return false;
    } finally {
      set({ saving: false });
    }
  },

  resetToDefaults: async () => {
    set({ saving: true });
    try {
      const res = await axios.post('/api/v1/configuracion-visual/reset');
      if (res.data) {
        const reseted = { ...DEFAULT_THEME_CONFIG, ...res.data };
        set({ config: reseted, previewConfig: null });
        get().applyThemeToDOM(reseted);
        toast.success('Se han restablecido los valores de fábrica');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Error al restablecer la configuración');
      return false;
    } finally {
      set({ saving: false });
    }
  },

  setPreview: (tempConfig: ThemeConfig | null) => {
    set({ previewConfig: tempConfig });
    if (tempConfig) {
      get().applyThemeToDOM(tempConfig);
    } else {
      get().applyThemeToDOM(get().config);
    }
  },

  applyPreset: (preset: PresetTema) => {
    const current = get().config;
    const updated: ThemeConfig = {
      ...current,
      presetTema: preset.id,
      colorPrimario: preset.colorPrimario,
      colorSecundario: preset.colorSecundario,
      colorAcento: preset.colorAcento,
      colorFondo: preset.colorFondo,
      colorSidebar: preset.colorSidebar,
      colorNavbar: preset.colorNavbar,
      colorTexto: preset.colorTexto,
      modoOscuro: preset.modoOscuro,
      estiloBorde: preset.estiloBorde,
      fuentePrincipal: preset.fuentePrincipal,
    };
    set({ config: updated });
    get().applyThemeToDOM(updated);
    toast.info(`Preset aplicado: "${preset.nombre}". Recuerda presionar "Guardar Cambios".`);
  },
}));
