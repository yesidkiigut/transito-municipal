import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore, ThemeConfig } from '@/store/themeStore';
import { LOGO_PRESETS } from './constants/logoPresets';
import {
  Palette,
  Building2,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  Shield,
  CreditCard,
  Car,
  FileCheck,
  Globe,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Laptop,
  Moon,
  Sun,
  Layout as LayoutIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const BrandingPage: React.FC = () => {
  const { config, presets, saving, fetchConfig, fetchPresets, saveConfig, resetToDefaults, applyPreset, setPreview } =
    useThemeStore();

  const [activeTab, setActiveTab] = useState<'identidad' | 'colores' | 'logos' | 'presets' | 'preview'>('identidad');
  const [formData, setFormData] = useState<ThemeConfig>({ ...config });
  const [previewModeActive, setPreviewModeActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importJsonRef = useRef<HTMLInputElement>(null);
  const [targetUploadField, setTargetUploadField] = useState<'logoUrl' | 'escudoUrl' | 'faviconUrl' | 'bannerLoginUrl'>('logoUrl');

  useEffect(() => {
    fetchConfig();
    fetchPresets();
  }, []);

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  const handleChange = (field: keyof ThemeConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (previewModeActive) {
      setPreview(updated);
    }
  };

  const toggleLivePreview = () => {
    if (!previewModeActive) {
      setPreviewModeActive(true);
      setPreview(formData);
      toast.info('Modo de previsualización en vivo activado');
    } else {
      setPreviewModeActive(false);
      setPreview(null);
      toast.info('Modo de previsualización desactivado');
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ok = await saveConfig(formData);
    if (ok) {
      setPreviewModeActive(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('¿Estás seguro de que deseas restablecer todos los colores, logos y textos a los valores de fábrica?')) {
      const ok = await resetToDefaults();
      if (ok) {
        setPreviewModeActive(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleChange(targetUploadField, base64);
      toast.success('Imagen cargada correctamente');
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (field: 'logoUrl' | 'escudoUrl' | 'faviconUrl' | 'bannerLoginUrl') => {
    setTargetUploadField(field);
    fileInputRef.current?.click();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tema_transito_${formData.nombreMunicipio.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Configuración exportada en JSON');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setFormData({ ...formData, ...json });
        if (previewModeActive) setPreview({ ...formData, ...json });
        toast.success('Configuración importada exitosamente. Guarda los cambios para aplicar.');
      } catch (err) {
        toast.error('El archivo JSON no tiene un formato válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      <input type="file" ref={importJsonRef} onChange={handleImportJSON} accept=".json" className="hidden" />

      {/* Header Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-3.5 py-1 rounded-full shadow-inner">
              <Palette size={14} className="text-cyan-400" /> Módulo Full-Stack de Marca Blanca (White-Label)
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Identidad Visual, Logos & Paleta Institucional
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Personaliza integralmente la apariencia del sistema para cualquier Alcaldía, Gobernación u Organismo de Tránsito. Modifica nombres, escudos, logos, esquemas de color, tipografía y presets con aplicación inmediata en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleLivePreview}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition ${
                previewModeActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Previsualizar cambios en toda la interfaz sin guardar aún"
            >
              <Eye size={16} /> {previewModeActive ? 'Previsualización Activa' : 'Previsualizar en Vivo'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700/60 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-2 transition"
              title="Restaurar a la configuración oficial inicial"
            >
              <RotateCcw size={16} /> Restablecer
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 active:scale-95"
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('identidad')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'identidad'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Building2 size={16} /> 1. Identidad Institucional
        </button>

        <button
          onClick={() => setActiveTab('colores')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'colores'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Palette size={16} /> 2. Colores & Tipografía
        </button>

        <button
          onClick={() => setActiveTab('logos')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'logos'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <ImageIcon size={16} /> 3. Logos & Escudos
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'presets'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Sparkles size={16} /> 4. Presets Oficiales (1 Clic)
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'preview'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Eye size={16} /> 5. Simulador en Vivo
        </button>
      </div>

      {/* TAB 1: IDENTIDAD INSTITUCIONAL */}
      {activeTab === 'identidad' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario Principal */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="text-cyan-400" size={20} />
                  Información Legal y Entidad Territorial
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estos datos se reflejarán en los encabezados, resoluciones oficiales, pie de página y certificados.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Alcaldía / Municipio *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreMunicipio}
                    onChange={(e) => handleChange('nombreMunicipio', e.target.value)}
                    placeholder="Ej. Alcaldía de San Mateo"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Organismo de Tránsito / Secretaría *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreSecretaria}
                    onChange={(e) => handleChange('nombreSecretaria', e.target.value)}
                    placeholder="Ej. Secretaría de Tránsito y Transporte"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    NIT / Identificación Tributaria *
                  </label>
                  <input
                    type="text"
                    value={formData.nitAlcaldia}
                    onChange={(e) => handleChange('nitAlcaldia', e.target.value)}
                    placeholder="Ej. 890.123.456-7"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Slogan / Lema Institucional
                  </label>
                  <input
                    type="text"
                    value={formData.lema}
                    onChange={(e) => handleChange('lema', e.target.value)}
                    placeholder="Ej. Movilidad Segura y Humana"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-cyan-400" /> Canales de Atención Ciudadana & Contacto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Dirección de Sede Principal
                    </label>
                    <input
                      type="text"
                      value={formData.direccionSede}
                      onChange={(e) => handleChange('direccionSede', e.target.value)}
                      placeholder="Ej. Carrera 7 # 12-40, Piso 1"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Teléfono / Línea de Atención
                    </label>
                    <input
                      type="text"
                      value={formData.telefonoContacto}
                      onChange={(e) => handleChange('telefonoContacto', e.target.value)}
                      placeholder="Ej. +57 (601) 745-8900"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Correo Electrónico Oficial
                    </label>
                    <input
                      type="email"
                      value={formData.correoContacto}
                      onChange={(e) => handleChange('correoContacto', e.target.value)}
                      placeholder="contacto@transito.gov.co"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Portal Web Oficial
                    </label>
                    <input
                      type="url"
                      value={formData.portalWebUrl}
                      onChange={(e) => handleChange('portalWebUrl', e.target.value)}
                      placeholder="https://transitomunicipal.gov.co"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Texto de Pie de Página (Copyright & Normativa)
                </label>
                <textarea
                  rows={2}
                  value={formData.textoPiePagina}
                  onChange={(e) => handleChange('textoPiePagina', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="© 2026 Alcaldía Municipal..."
                />
              </div>
            </div>

            {/* Tarjeta Informativa Lateral & Export/Import */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="text-cyan-400" size={18} /> Respaldo & Portabilidad
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Puedes exportar la configuración visual completa a un archivo JSON para replicarla en otros municipios o respaldarla antes de hacer cambios.
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Download size={15} /> Exportar Tema (.json)
                  </button>

                  <button
                    type="button"
                    onClick={() => importJsonRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Upload size={15} /> Importar Tema (.json)
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Shield size={16} /> Ley 1712 de 2014 & Transparencia
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Las entidades públicas en Colombia deben mostrar claramente su NIT, razón social y canales de atención ciudadana en toda plataforma digital de trámites.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLORES & TIPOGRAFIA */}
      {activeTab === 'colores' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selectores de Color */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="text-cyan-400" size={20} />
                  Paleta de Color Primaria, Secundaria y Fondos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en cualquier cuadro de color para abrir el selector cromático o escribe el valor hexadecimal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Color Primario */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Color Primario</span>
                    <span className="text-[10px] text-slate-400 font-mono">Botones & Acentos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.colorPrimario}
                      onChange={(e) => handleChange('colorPrimario', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.colorPrimario}
                      onChange={(e) => handleChange('colorPrimario', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Color Secundario */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Color Secundario</span>
                    <span className="text-[10px] text-slate-400 font-mono">Gradientes & Badges</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.colorSecundario}
                      onChange={(e) => handleChange('colorSecundario', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.colorSecundario}
                      onChange={(e) => handleChange('colorSecundario', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Color Acento */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Color de Acento</span>
                    <span className="text-[10px] text-slate-400 font-mono">Detalles & Sombras</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.colorAcento}
                      onChange={(e) => handleChange('colorAcento', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.colorAcento}
                      onChange={(e) => handleChange('colorAcento', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Colores de Estructura / Layout */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <LayoutIcon size={16} className="text-cyan-400" /> Colores de Estructura de Interfaz
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fondo General */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-200">Fondo General (Body)</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.colorFondo}
                        onChange={(e) => handleChange('colorFondo', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.colorFondo}
                        onChange={(e) => handleChange('colorFondo', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Barra Superior (Navbar) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-200">Barra Superior (Navbar)</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.colorNavbar}
                        onChange={(e) => handleChange('colorNavbar', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.colorNavbar}
                        onChange={(e) => handleChange('colorNavbar', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Barra Lateral (Sidebar) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-200">Barra Lateral (Sidebar)</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.colorSidebar}
                        onChange={(e) => handleChange('colorSidebar', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.colorSidebar}
                        onChange={(e) => handleChange('colorSidebar', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipografía y Estilo de Bordes */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" /> Tipografía & Geometría de Componentes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Fuente Tipográfica Principal
                    </label>
                    <select
                      value={formData.fuentePrincipal}
                      onChange={(e) => handleChange('fuentePrincipal', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value="Outfit">Outfit (Moderna, Geométrica & Legible)</option>
                      <option value="Inter">Inter (Estándar Corporativo / Gubernamental)</option>
                      <option value="Montserrat">Montserrat (Elegante & Solemne)</option>
                      <option value="Roboto">Roboto (Clásica & Clara)</option>
                      <option value="Poppins">Poppins (Redondeada & Amigable)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Estilo de Bordes y Tarjetas
                    </label>
                    <select
                      value={formData.estiloBorde}
                      onChange={(e) => handleChange('estiloBorde', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value="rounded-2xl">Extra Redondeado Moderno (2xl)</option>
                      <option value="rounded-xl">Redondeado Suave Estándar (xl)</option>
                      <option value="rounded-lg">Sutil Redondeado (lg)</option>
                      <option value="rounded-none">Cuadrado Sobrio / Minimalista</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Muestra Rápida de Componentes en vivo */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="text-cyan-400" size={18} /> Muestra Rápida de Componentes
                </h3>
                <p className="text-xs text-slate-400">
                  Previsualización en tiempo real de botones y badges con los colores seleccionados:
                </p>

                {/* Botón Primario Demo */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400">Botón de Acción Principal:</span>
                  <button
                    type="button"
                    style={{
                      background: `linear-gradient(to right, ${formData.colorPrimario}, ${formData.colorSecundario})`,
                      color: '#ffffff',
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition hover:opacity-90"
                  >
                    <Check size={16} /> Radicar Trámite Online
                  </button>
                </div>

                {/* Badges Demo */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400">Insignias & Badges:</span>
                  <div className="flex flex-wrap gap-2">
                    <span
                      style={{
                        backgroundColor: `${formData.colorPrimario}25`,
                        color: formData.colorPrimario,
                        borderColor: `${formData.colorPrimario}80`,
                      }}
                      className="text-xs font-bold px-3 py-1 rounded-full border shadow-sm"
                    >
                      VIGENTE 10 AÑOS
                    </span>
                    <span
                      style={{
                        backgroundColor: `${formData.colorSecundario}25`,
                        color: formData.colorSecundario,
                        borderColor: `${formData.colorSecundario}80`,
                      }}
                      className="text-xs font-bold px-3 py-1 rounded-full border shadow-sm"
                    >
                      PAZ Y SALVO SIMIT
                    </span>
                  </div>
                </div>

                {/* Card Demo */}
                <div
                  style={{
                    backgroundColor: formData.colorSidebar,
                    borderColor: `${formData.colorPrimario}40`,
                  }}
                  className="p-4 rounded-2xl border space-y-1.5 shadow-inner"
                >
                  <span className="text-[10px] font-mono uppercase font-bold" style={{ color: formData.colorPrimario }}>
                    TRM-2026-DEMO
                  </span>
                  <div className="text-xs font-bold text-white">Matrícula Inicial Automotor</div>
                  <p className="text-[11px] text-slate-400">Organismo: {formData.nombreSecretaria}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGOS, ESCUDOS & MULTIMEDIA */}
      {activeTab === 'logos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Principal */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ImageIcon className="text-cyan-400" size={18} />
                    Logo Principal / Emblema de Tránsito
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Se utiliza en la barra superior (Navbar), pantalla de inicio de sesión y pie de página.
                  </p>
                </div>
              </div>

              {/* Vista Previa del Logo Actual */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[160px] relative">
                {formData.logoUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={formData.logoUrl} alt="Logo Principal" className="max-h-24 max-w-[200px] object-contain drop-shadow-md" />
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check size={13} /> Logo Personalizado Cargado
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                      <Building2 size={32} />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Usando Icono Predeterminado</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerUpload('logoUrl')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-cyan-600/20"
                >
                  <Upload size={15} /> Subir Archivo (PNG / SVG / JPG)
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', '')}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 text-xs font-bold transition"
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">O pegar URL directa de imagen:</label>
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://ejemplo.gov.co/logo-transito.png"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Escudo Municipal de Armas */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="text-cyan-400" size={18} />
                  Escudo Municipal / Escudo de Armas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Se plasma en las licencias de conducción digitales y resoluciones sancionatorias oficiales.
                </p>
              </div>

              {/* Vista Previa del Escudo */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[160px]">
                {formData.escudoUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={formData.escudoUrl} alt="Escudo Municipal" className="max-h-24 max-w-[200px] object-contain drop-shadow-md" />
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check size={13} /> Escudo Oficial Cargado
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Shield size={44} className="text-slate-600" />
                    <span className="text-xs text-slate-400 font-medium">Sin escudo específico configurado</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerUpload('escudoUrl')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-cyan-600/20"
                >
                  <Upload size={15} /> Subir Escudo (PNG / SVG)
                </button>
                {formData.escudoUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('escudoUrl', '')}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 text-xs font-bold transition"
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">O pegar URL directa:</label>
                <input
                  type="text"
                  value={formData.escudoUrl || ''}
                  onChange={(e) => handleChange('escudoUrl', e.target.value)}
                  placeholder="https://ejemplo.gov.co/escudo-armas.png"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Galería de Escudos & Emblemas Vectoriales de Ejemplo */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="text-cyan-400" size={18} />
                Emblemas & Escudos Vectoriales Listos para Usar
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ¿No dispones de un archivo PNG listo? Elige uno de nuestros emblemas vectoriales de alta fidelidad con un solo clic:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              {LOGO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition group flex flex-col items-center text-center space-y-3"
                >
                  <img src={preset.svgDataUri} alt={preset.nombre} className="w-20 h-20 object-contain group-hover:scale-105 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{preset.nombre}</h4>
                    <span className="text-[10px] text-cyan-400 font-mono">{preset.categoria}</span>
                  </div>
                  <div className="flex gap-1.5 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('logoUrl', preset.svgDataUri);
                        toast.success(`Logo asignado: ${preset.nombre}`);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-[10px] font-bold transition"
                    >
                      Como Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('escudoUrl', preset.svgDataUri);
                        toast.success(`Escudo asignado: ${preset.nombre}`);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-[10px] font-bold transition"
                    >
                      Como Escudo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRESETS OFICIALES */}
      {activeTab === 'presets' && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="text-cyan-400" size={20} />
              Colección de Presets Temáticos Oficiales
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Aplica combinaciones completas de colores primarios, secundarios, fondos, bordes y fuentes diseñadas específicamente para entidades de tránsito y alcaldías con 1 solo clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((p) => {
              const isCurrent = formData.presetTema === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-xl ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-500 shadow-cyan-950/60 ring-2 ring-cyan-500/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-extrabold text-white">{p.nombre}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Fuente: {p.fuentePrincipal} • {p.estiloBorde}</span>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold flex items-center gap-1">
                          <Check size={11} /> Activo
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed min-h-[40px]">{p.descripcion}</p>

                    {/* Muestrario de Colores del Preset */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Paleta del Preset:</span>
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: p.colorPrimario }}
                          className="w-7 h-7 rounded-xl shadow-md border border-white/20"
                          title={`Primario: ${p.colorPrimario}`}
                        />
                        <div
                          style={{ backgroundColor: p.colorSecundario }}
                          className="w-7 h-7 rounded-xl shadow-md border border-white/20"
                          title={`Secundario: ${p.colorSecundario}`}
                        />
                        <div
                          style={{ backgroundColor: p.colorAcento }}
                          className="w-7 h-7 rounded-xl shadow-md border border-white/20"
                          title={`Acento: ${p.colorAcento}`}
                        />
                        <div
                          style={{ backgroundColor: p.colorSidebar }}
                          className="w-7 h-7 rounded-xl shadow-md border border-white/20"
                          title={`Sidebar: ${p.colorSidebar}`}
                        />
                        <div
                          style={{ backgroundColor: p.colorFondo }}
                          className="w-7 h-7 rounded-xl shadow-md border border-white/20"
                          title={`Fondo: ${p.colorFondo}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        applyPreset(p);
                        setFormData({
                          ...formData,
                          presetTema: p.id,
                          colorPrimario: p.colorPrimario,
                          colorSecundario: p.colorSecundario,
                          colorAcento: p.colorAcento,
                          colorFondo: p.colorFondo,
                          colorSidebar: p.colorSidebar,
                          colorNavbar: p.colorNavbar,
                          colorTexto: p.colorTexto,
                          modoOscuro: p.modoOscuro,
                          estiloBorde: p.estiloBorde,
                          fuentePrincipal: p.fuentePrincipal,
                        });
                      }}
                      style={{
                        background: isCurrent ? undefined : `linear-gradient(to right, ${p.colorPrimario}, ${p.colorSecundario})`,
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                          : 'text-white shadow-lg hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {isCurrent ? 'Tema Ya Aplicado' : 'Aplicar Este Preset'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: SIMULADOR EN VIVO */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="text-cyan-400" size={20} />
              Simulador Integral de Experiencia de Usuario
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Observa cómo interactúan todos los componentes visuales configurados (Header, Sidebar, Licencias con sellos legales, Trámites y Pantalla de Autenticación).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulador de Pantalla / Workspace */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mockup de la Barra Superior */}
              <div
                style={{ backgroundColor: formData.colorNavbar }}
                className="p-4 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                  ) : (
                    <div
                      style={{
                        background: `linear-gradient(to top right, ${formData.colorPrimario}, ${formData.colorSecundario})`,
                      }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-bold"
                    >
                      <Building2 size={20} />
                    </div>
                  )}
                  <div>
                    <span
                      style={{
                        background: `linear-gradient(to right, ${formData.colorPrimario}, ${formData.colorSecundario})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                      className="font-extrabold text-base tracking-tight"
                    >
                      {formData.nombreMunicipio}
                    </span>
                    <p className="text-[10px] text-slate-400">{formData.nombreSecretaria}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: `${formData.colorPrimario}20`,
                      color: formData.colorPrimario,
                      borderColor: `${formData.colorPrimario}60`,
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  >
                    Vigilado MinTransporte
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                    AD
                  </div>
                </div>
              </div>

              {/* Mockup de Licencia de Conducción Digital */}
              <div
                style={{
                  backgroundColor: formData.colorSidebar,
                  borderColor: `${formData.colorPrimario}50`,
                }}
                className="p-6 rounded-3xl border shadow-2xl space-y-4 relative overflow-hidden"
              >
                <div
                  style={{
                    backgroundColor: formData.colorPrimario,
                  }}
                  className="absolute -right-16 -top-16 w-36 h-36 opacity-10 rounded-full blur-2xl pointer-events-none"
                />

                <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {formData.escudoUrl ? (
                      <img src={formData.escudoUrl} alt="Escudo" className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                        <CreditCard size={24} />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">REPÚBLICA DE COLOMBIA</span>
                      <h4 className="text-sm font-extrabold text-white">{formData.nombreSecretaria}</h4>
                      <p className="text-[10px] text-slate-400">Licencia de Conducción Digital • Ley 2161 de 2021</p>
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: `${formData.colorPrimario}25`,
                      color: formData.colorPrimario,
                      borderColor: `${formData.colorPrimario}80`,
                    }}
                    className="px-3 py-1 rounded-full text-xs font-bold border"
                  >
                    CAT. B1 • VIGENTE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Titular:</span>
                    <p className="font-bold text-white mt-0.5">Carlos Eduardo Mendoza</p>
                    <span className="text-slate-400 text-[10px]">C.C. 1.098.765.432</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">N° Licencia:</span>
                    <p className="font-mono font-bold text-amber-400 mt-0.5">LIC-2026-98721</p>
                    <span className="text-slate-400 text-[10px]">Puntaje: 12/12 Puntos</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Expedición / Vencimiento:</span>
                    <p className="font-bold text-emerald-400 mt-0.5">14/08/2024 - 14/08/2034</p>
                    <span className="text-slate-400 text-[10px]">10 Años de Vigencia</span>
                  </div>
                </div>
              </div>

              {/* Mockup de Tarjeta de Trámite */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileCheck className="text-cyan-400" size={18} />
                    <span className="text-sm font-bold text-white">Workflow de Radicación de Trámite</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                    EN REVISIÓN JURÍDICA
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Traspaso de Propiedad de Vehículo Particular • Placa <strong className="text-white">KIG-982</strong> • Solicitante: Carlos Mendoza.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    style={{
                      backgroundColor: `${formData.colorPrimario}20`,
                      color: formData.colorPrimario,
                      borderColor: `${formData.colorPrimario}60`,
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition"
                  >
                    Ver Expediente
                  </button>
                  <button
                    type="button"
                    style={{
                      background: `linear-gradient(to right, ${formData.colorPrimario}, ${formData.colorSecundario})`,
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition"
                  >
                    Aprobar Paso
                  </button>
                </div>
              </div>
            </div>

            {/* Simulador de Pantalla de Login en Miniatura */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop size={14} className="text-cyan-400" /> Simulador de Login
                </span>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-inner">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-12 h-12 object-contain mx-auto" />
                  ) : (
                    <div
                      style={{
                        background: `linear-gradient(to top right, ${formData.colorPrimario}, ${formData.colorSecundario})`,
                      }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md font-bold"
                    >
                      <Building2 size={22} />
                    </div>
                  )}

                  <div>
                    <h5 className="font-extrabold text-sm text-white">{formData.nombreMunicipio}</h5>
                    <p className="text-[10px] text-slate-400">{formData.nombreSecretaria}</p>
                    <p className="text-[9px] text-cyan-400 italic mt-0.5">"{formData.lema}"</p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="h-7 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-500 flex items-center px-2">
                      usuario@transito.gov.co
                    </div>
                    <div className="h-7 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-500 flex items-center px-2">
                      ••••••••••••
                    </div>
                    <button
                      type="button"
                      style={{
                        background: `linear-gradient(to right, ${formData.colorPrimario}, ${formData.colorSecundario})`,
                      }}
                      className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white shadow"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center border-t border-slate-900 pt-3">
                {formData.textoPiePagina}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
