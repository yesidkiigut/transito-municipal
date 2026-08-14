import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { liquidacionService } from '@/features/impuestos/services/liquidacionService';
import {
  Settings,
  Percent,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Save,
  ShieldCheck,
  FileText,
  Zap,
  Play,
  Flame,
  Clock
} from 'lucide-react';

export const ConfiguracionNormativaPage: React.FC = () => {
  const { config } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'reglas' | 'parametros' | 'tasas' | 'masiva'>('reglas');
  const [loading, setLoading] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [reglas, setReglas] = useState<any[]>([]);
  const [parametros, setParametros] = useState<any[]>([]);
  const [tasas, setTasas] = useState<any[]>([]);

  // Estado para Liquidación Masiva
  const [vigenciaMasiva, setVigenciaMasiva] = useState<number>(2026);
  const [ejecutandoMasiva, setEjecutandoMasiva] = useState<boolean>(false);
  const [resultadoMasiva, setResultadoMasiva] = useState<any | null>(null);

  // Formulario de Nueva Regla de Descuento
  const [nuevaRegla, setNuevaRegla] = useState({
    codigo: '',
    descripcion: '',
    diasHabilesMin: 1,
    diasHabilesMax: 5,
    porcentajeDescuento: 50,
    requiereCurso: true,
    leyReferencia: 'Decreto Municipal 2026',
    activo: true,
  });

  // Formulario de Parámetro Anual
  const [nuevoParam, setNuevoParam] = useState({
    vigenciaFiscal: 2026,
    uvtValor: 52380,
    smmlvValor: 1530000,
    sancionMinimaMora: 262000,
    porcentajeDescuentoProntoPago: 10,
    fechaLimiteProntoPago: '2026-05-31',
    activo: true,
  });

  // Formulario de Tasa de Mora
  const [nuevaTasa, setNuevaTasa] = useState({
    anio: 2026,
    mes: 9,
    tasaEfectivaAnual: 22.5,
    tasaNominalMensual: 1.69,
    tasaDiaria: 0.0563,
    resolucionSuperfinanciera: 'Resolución SFC 120/2026',
    activo: true,
  });

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'reglas') {
        const data = await liquidacionService.listarReglasDescuento();
        setReglas(data);
      } else if (activeTab === 'parametros') {
        const data = await liquidacionService.listarParametrosAnuales();
        setParametros(data);
      } else if (activeTab === 'tasas') {
        const data = await liquidacionService.listarTasasMora();
        setTasas(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar configuración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const handleGuardarRegla = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    try {
      await liquidacionService.crearReglaDescuento(nuevaRegla);
      setMensajeExito('Regla de descuento guardada exitosamente en la base de datos.');
      setNuevaRegla({
        codigo: '',
        descripcion: '',
        diasHabilesMin: 1,
        diasHabilesMax: 5,
        porcentajeDescuento: 50,
        requiereCurso: true,
        leyReferencia: 'Decreto Municipal 2026',
        activo: true,
      });
      cargarDatos();
    } catch (err: any) {
      setError(err.message || 'Error al guardar regla de descuento.');
    }
  };

  const handleToggleRegla = async (id: string, activoActual: boolean) => {
    try {
      await liquidacionService.toggleReglaDescuento(id, !activoActual);
      cargarDatos();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado.');
    }
  };

  const handleGuardarParametro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    try {
      await liquidacionService.guardarParametroAnual(nuevoParam);
      setMensajeExito(`Parámetros fiscales de la vigencia ${nuevoParam.vigenciaFiscal} actualizados.`);
      cargarDatos();
    } catch (err: any) {
      setError(err.message || 'Error al guardar parámetros.');
    }
  };

  const handleRegistrarTasa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    try {
      await liquidacionService.registrarTasaMora(nuevaTasa);
      setMensajeExito(`Tasa de mora para el período ${nuevaTasa.anio}-${nuevaTasa.mes} registrada.`);
      cargarDatos();
    } catch (err: any) {
      setError(err.message || 'Error al registrar tasa de mora.');
    }
  };

  const handleEjecutarMasiva = async () => {
    setEjecutandoMasiva(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await liquidacionService.ejecutarLiquidacionMasiva(vigenciaMasiva);
      setResultadoMasiva(res);
      setMensajeExito(`Liquidación masiva de la vigencia ${vigenciaMasiva} ejecutada exitosamente en ${res.tiempoEjecucionMs} ms.`);
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar liquidación masiva.');
    } finally {
      setEjecutandoMasiva(false);
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Settings size={14} /> Panel Administrativo
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configuración Normativa & Motor de Cálculo
          </h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
            Ingresa y administra las reglas de descuento, amnistías tributarias, valores anuales de UVT/SMMLV y tasas de usura certificadas. Los procedimientos almacenados aplicarán estos cambios inmediatamente a todos los cálculos.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('reglas')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'reglas'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Percent size={16} />
            <span>Reglas de Descuento & Amnistías ({reglas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parametros')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'parametros'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar size={16} />
            <span>Parámetros Fiscales Anuales (UVT/SMMLV)</span>
          </button>

          <button
            onClick={() => setActiveTab('tasas')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'tasas'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp size={16} />
            <span>Tasas de Interés de Mora (Superfinanciera)</span>
          </button>

          <button
            onClick={() => setActiveTab('masiva')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'masiva'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg font-black'
                : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
            }`}
          >
            <Zap size={16} />
            <span>⚡ Liquidación Masiva Anual</span>
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 1: REGLAS DE DESCUENTO Y AMNISTÍAS */}
      {/* ======================================================== */}
      {activeTab === 'reglas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulario Nueva Regla (5 columnas) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Plus size={20} className="text-cyan-400" />
              <span>Crear / Editar Regla o Amnistía</span>
            </h2>

            <form onSubmit={handleGuardarRegla} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Código Único</label>
                <input
                  type="text"
                  required
                  placeholder="ej: AMNISTIA_ALIVIO_2026"
                  value={nuevaRegla.codigo}
                  onChange={(e) => setNuevaRegla({ ...nuevaRegla, codigo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Descripción o Nombre Legal</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 80% de descuento en comparendos por Decreto Municipal"
                  value={nuevaRegla.descripcion}
                  onChange={(e) => setNuevaRegla({ ...nuevaRegla, descripcion: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Día Hábil Mín.</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={nuevaRegla.diasHabilesMin}
                    onChange={(e) => setNuevaRegla({ ...nuevaRegla, diasHabilesMin: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Día Hábil Máx.</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevaRegla.diasHabilesMax}
                    onChange={(e) => setNuevaRegla({ ...nuevaRegla, diasHabilesMax: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">% Descuento</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={nuevaRegla.porcentajeDescuento}
                      onChange={(e) => setNuevaRegla({ ...nuevaRegla, porcentajeDescuento: Number(e.target.value) })}
                      className="w-full bg-slate-950/80 border border-slate-700 text-emerald-400 px-4 py-2.5 rounded-xl text-lg font-black"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Referencia Legal</label>
                  <input
                    type="text"
                    value={nuevaRegla.leyReferencia}
                    onChange={(e) => setNuevaRegla({ ...nuevaRegla, leyReferencia: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevaRegla.requiereCurso}
                    onChange={(e) => setNuevaRegla({ ...nuevaRegla, requiereCurso: e.target.checked })}
                    className="rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>Requiere Curso Pedagógico</span>
                </label>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
                className="w-full py-3 rounded-2xl text-slate-950 font-bold text-sm shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} />
                <span>Guardar Regla en Base de Datos</span>
              </button>
            </form>
          </div>

          {/* Listado de Reglas Activas (7 columnas) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center justify-between">
              <span>Reglas Parametrizadas en el Sistema</span>
              <span className="text-xs font-semibold text-slate-400">Aplicación Inmediata</span>
            </h2>

            <div className="space-y-3">
              {reglas.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                    r.activo ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm font-mono">{r.codigo}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {r.porcentajeDescuento}% Descuento
                      </span>
                      {r.requiereCurso && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Requiere Curso
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300">{r.descripcion}</div>
                    <div className="text-[11px] text-slate-500">
                      Rango: Días hábiles {r.diasHabilesMin} a {r.diasHabilesMax} • {r.leyReferencia}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleRegla(r.id, r.activo)}
                    className={`p-2 rounded-xl border transition ${
                      r.activo
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                    title={r.activo ? 'Desactivar Regla' : 'Activar Regla'}
                  >
                    {r.activo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 2: PARÁMETROS FISCALES ANUALES */}
      {/* ======================================================== */}
      {activeTab === 'parametros' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white">Actualizar Valores Fiscales del Año</h2>
            <form onSubmit={handleGuardarParametro} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Vigencia Fiscal (Año)</label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  required
                  value={nuevoParam.vigenciaFiscal}
                  onChange={(e) => setNuevoParam({ ...nuevoParam, vigenciaFiscal: Number(e.target.value) })}
                  className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Valor UVT ($ COP)</label>
                  <input
                    type="number"
                    required
                    value={nuevoParam.uvtValor}
                    onChange={(e) => setNuevoParam({ ...nuevoParam, uvtValor: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-cyan-400 px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Valor SMMLV ($ COP)</label>
                  <input
                    type="number"
                    required
                    value={nuevoParam.smmlvValor}
                    onChange={(e) => setNuevoParam({ ...nuevoParam, smmlvValor: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Sanción Mínima ($)</label>
                  <input
                    type="number"
                    required
                    value={nuevoParam.sancionMinimaMora}
                    onChange={(e) => setNuevoParam({ ...nuevoParam, sancionMinimaMora: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-amber-400 px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">% Pronto Pago</label>
                  <input
                    type="number"
                    required
                    value={nuevoParam.porcentajeDescuentoProntoPago}
                    onChange={(e) => setNuevoParam({ ...nuevoParam, porcentajeDescuentoProntoPago: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Fecha Límite Pronto Pago</label>
                <input
                  type="date"
                  required
                  value={nuevoParam.fechaLimiteProntoPago}
                  onChange={(e) => setNuevoParam({ ...nuevoParam, fechaLimiteProntoPago: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
                className="w-full py-3 rounded-2xl text-slate-950 font-bold text-sm shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} />
                <span>Actualizar Parámetro Fiscal</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white">Vigencias Configuradas en Base de Datos</h2>
            <div className="space-y-3">
              {parametros.map((p) => (
                <div key={p.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-white">Vigencia Fiscal {p.vigenciaFiscal}</span>
                    <span className="text-xs text-emerald-400 font-bold">{p.porcentajeDescuentoProntoPago}% Pronto Pago</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                    <div>UVT: <strong className="text-cyan-400">${p.uvtValor.toLocaleString('es-CO')}</strong></div>
                    <div>SMMLV: <strong>${p.smmlvValor.toLocaleString('es-CO')}</strong></div>
                    <div>Sanción Mín: <strong className="text-amber-400">${p.sancionMinimaMora.toLocaleString('es-CO')}</strong></div>
                  </div>
                  <div className="text-[11px] text-slate-500 border-t border-slate-800/60 pt-1">
                    Límite Pronto Pago: {new Date(p.fechaLimiteProntoPago).toLocaleDateString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 3: TASAS DE INTERÉS DE MORA */}
      {/* ======================================================== */}
      {activeTab === 'tasas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white">Registrar Tasa de Usura Mensual</h2>
            <form onSubmit={handleRegistrarTasa} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Año</label>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    required
                    value={nuevaTasa.anio}
                    onChange={(e) => setNuevaTasa({ ...nuevaTasa, anio: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Mes (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={nuevaTasa.mes}
                    onChange={(e) => setNuevaTasa({ ...nuevaTasa, mes: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">T.E.A. (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={nuevaTasa.tasaEfectivaAnual}
                    onChange={(e) => setNuevaTasa({ ...nuevaTasa, tasaEfectivaAnual: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-amber-400 px-3 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">T.N.M. (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={nuevaTasa.tasaNominalMensual}
                    onChange={(e) => setNuevaTasa({ ...nuevaTasa, tasaNominalMensual: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Diaria (%)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={nuevaTasa.tasaDiaria}
                    onChange={(e) => setNuevaTasa({ ...nuevaTasa, tasaDiaria: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700 text-cyan-400 px-3 py-2.5 rounded-xl text-sm font-bold mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Resolución Superfinanciera</label>
                <input
                  type="text"
                  value={nuevaTasa.resolucionSuperfinanciera}
                  onChange={(e) => setNuevaTasa({ ...nuevaTasa, resolucionSuperfinanciera: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
                className="w-full py-3 rounded-2xl text-slate-950 font-bold text-sm shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} />
                <span>Registrar Tasa en Base de Datos</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white">Histórico de Tasas para Cálculo de Mora</h2>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-3 text-right">T.E.A.</th>
                    <th className="py-2.5 px-3 text-right">T.N.M.</th>
                    <th className="py-2.5 px-3 text-right">Tasa Diaria</th>
                    <th className="py-2.5 px-3">Resolución SFC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tasas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-bold text-white">{t.anio}-{String(t.mes).padStart(2, '0')}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400 font-bold">{t.tasaEfectivaAnual}%</td>
                      <td className="py-2.5 px-3 text-right">{t.tasaNominalMensual}%</td>
                      <td className="py-2.5 px-3 text-right text-cyan-400 font-mono">{t.tasaDiaria}%</td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{t.resolucionSuperfinanciera}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 4: LIQUIDACIÓN MASIVA DEL PARQUE AUTOMOTOR */}
      {/* ======================================================== */}
      {activeTab === 'masiva' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
                  <Zap size={14} className="text-amber-400" /> Motor PL/pgSQL en Lote
                </div>
                <h2 className="text-2xl font-black text-white">
                  Liquidación Masiva de Impuesto Vehicular
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Ejecuta el Procedimiento Almacenado masivo para liquidar en lote todo el parque automotor activo del municipio, calculando avalúos, rangos en UVT, tarifas oficiales y fechas de pronto pago en pocos segundos.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Vigencia a Liquidar</label>
                  <select
                    value={vigenciaMasiva}
                    onChange={(e) => setVigenciaMasiva(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-white font-bold text-base px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value={2026}>Vigencia 2026</option>
                    <option value={2025}>Vigencia 2025</option>
                    <option value={2024}>Vigencia 2024</option>
                  </select>
                </div>

                <button
                  onClick={handleEjecutarMasiva}
                  disabled={ejecutandoMasiva}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm shadow-xl hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {ejecutandoMasiva ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Ejecutando en Base de Datos...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      <span>⚡ Disparar Liquidación Masiva</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dashboard de Resultados de la Liquidación Masiva */}
            {resultadoMasiva && (
              <div className="space-y-4 pt-6 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Resultados de la Liquidación en Lote (Vigencia {resultadoMasiva.vigenciaFiscal})</span>
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                    ⏱️ Procesado en {resultadoMasiva.tiempoEjecucionMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Vehículos Liquidados</div>
                    <div className="text-2xl font-black text-white mt-1">
                      {resultadoMasiva.totalVehiculosLiquidados.toLocaleString('es-CO')}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 font-medium">
                      {resultadoMasiva.totalVehiculosAlDia} al día / {resultadoMasiva.totalVehiculosEnMora} en mora
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-cyan-500/30 p-4 rounded-2xl">
                    <div className="text-xs text-cyan-400 font-semibold uppercase">Recaudo Proyectado</div>
                    <div className="text-2xl font-black text-cyan-400 mt-1">
                      {formatCOP(resultadoMasiva.totalRecaudoProyectado)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ingresos municipales estimados</div>
                  </div>

                  <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl">
                    <div className="text-xs text-emerald-400 font-semibold uppercase">Descuentos Pronto Pago</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      {formatCOP(resultadoMasiva.totalDescuentosProntoPago)}
                    </div>
                    <div className="text-xs text-emerald-500/80 mt-1">Beneficios aplicables por ley</div>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl">
                    <div className="text-xs text-amber-400 font-semibold uppercase">Sanciones & Moras</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                      {formatCOP(resultadoMasiva.totalInteresesYSanciones)}
                    </div>
                    <div className="text-xs text-amber-500/80 mt-1">Recargos por extemporaneidad</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
