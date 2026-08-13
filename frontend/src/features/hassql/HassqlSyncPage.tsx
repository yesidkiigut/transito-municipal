import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import {
  Database,
  RefreshCw,
  Server,
  FileCheck2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Settings,
  ArrowRight,
  ExternalLink,
  Activity,
  Layers,
  FileText,
  DollarSign,
  Landmark,
  Save,
  Check,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

interface LoteSync {
  id: string;
  codigoLote: string;
  fechaInicio: string;
  fechaFin: string;
  totalTransacciones: number;
  totalRecaudado: number;
  totalPSE: number;
  totalBreB: number;
  estado: 'EXITOSO' | 'PARCIAL' | 'FALLIDO' | 'EN_PROCESO';
  comprobanteHassqlId?: string;
  archivoPlanoGenerado?: string;
  detallesContables?: string;
  createdAt: string;
}

export const HassqlSyncPage: React.FC = () => {
  const { config } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'control' | 'historial' | 'config'>('control');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [probandoConexion, setProbandoConexion] = useState(false);

  // Estadísticas y Lotes
  const [lotes, setLotes] = useState<LoteSync[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    transaccionesPendientes: 0,
    montoPendiente: 0,
  });

  // Configuración HASSQL
  const [configHassql, setConfigHassql] = useState({
    servidorHost: 'https://api.hassql.com.co',
    puerto: 1433,
    baseDatos: 'HASSQL_TRANSITO_MUNICIPAL',
    usuario: 'usr_transito_sync',
    password: '••••••••••••',
    tipoConexion: 'WEB_SERVICE_REST',
    tokenApi: 'hsql_tok_live_987654321_transito',
    endpointRecaudo: 'https://api.hassql.com.co/v1/recaudo/transito',
    horaCierreFiscal: '23:59',
    activo: true,
    autoSincronizar: true,
    formatoAsobancaria: true,
    codigoEntidadHassql: 'MUN-TRANSITO-001',
    cuentaBancariaRecaudo: 'CTA-CTE-123456789-BANCOLOMBIA',
  });

  // Modal para ver archivo Asobancaria / Detalles Contables
  const [loteDetalle, setLoteDetalle] = useState<LoteSync | null>(null);

  useEffect(() => {
    cargarLotes();
    cargarConfigHassql();
  }, []);

  const cargarLotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/hassql/lotes');
      const data = await res.json();
      if (res.ok) {
        setLotes(data.lotes || []);
        if (data.estadisticas) {
          setEstadisticas(data.estadisticas);
        }
      }
    } catch (err) {
      toast.error('Error al cargar lotes de sincronización con HASSQL');
    } finally {
      setLoading(false);
    }
  };

  const cargarConfigHassql = async () => {
    try {
      const res = await fetch('/api/v1/hassql/config');
      const data = await res.json();
      if (res.ok && data) {
        setConfigHassql({ ...data });
      }
    } catch (err) {
      console.error('Error al cargar configuración HASSQL');
    }
  };

  const handleSincronizarLote = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/v1/hassql/sincronizar-ahora', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al sincronizar');

      toast.success(`¡Sincronización exitosa! Comprobante HASSQL: ${data.comprobanteHassqlId}`);
      await cargarLotes();
    } catch (err: any) {
      toast.error(err.message || 'Error al ejecutar sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const handleProbarConexion = async () => {
    setProbandoConexion(true);
    try {
      const res = await fetch('/api/v1/hassql/probar-conexion', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Conexión exitosa con HASSQL (${data.latenciaMs}ms). Servidor activo.`);
      } else {
        toast.error(`Error: ${data.mensaje}`);
      }
    } catch (err) {
      toast.error('No se pudo conectar con el servidor HASSQL');
    } finally {
      setProbandoConexion(false);
    }
  };

  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/hassql/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configHassql),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      toast.success('Parámetros de conexión con HASSQL guardados correctamente');
      setConfigHassql({ ...data });
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivoPlano = (lote: LoteSync) => {
    if (!lote.archivoPlanoGenerado) {
      toast.error('Este lote no tiene archivo plano generado');
      return;
    }
    const blob = new Blob([lote.archivoPlanoGenerado], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASOBANCARIA2001_${lote.codigoLote}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo plano Asobancaria 2001 descargado');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-3.5 py-1 rounded-full shadow-inner">
              <Database size={14} className="text-cyan-400" /> Webservice & Daemon de Conciliación Contable
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sincronización Automática con HASSQL
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Puente de integración en tiempo real y cierre fiscal diario (00:00h) para asentar los recaudos de multas e impuestos vehiculares directamente en la Tesorería y Contabilidad Municipal de <strong>HASSQL</strong> (<a href="https://www.hassql.com.co" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">hassql.com.co</a>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleProbarConexion}
              disabled={probandoConexion}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
            >
              <Activity size={16} className={probandoConexion ? 'animate-spin text-cyan-400' : 'text-emerald-400'} />
              {probandoConexion ? 'Probando...' : 'Test Conexión HASSQL'}
            </button>

            <button
              type="button"
              onClick={handleSincronizarLote}
              disabled={syncing}
              style={{
                background: `linear-gradient(to right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'})`,
              }}
              className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 active:scale-95"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando Lote...' : 'Sincronizar Lote Diario Ahora'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('control')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'control'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Activity size={16} /> 1. Centro de Control & Métricas
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'historial'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Layers size={16} /> 2. Historial de Lotes & Cierres Diarios
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'config'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <Settings size={16} /> 3. Parámetros del Conector HASSQL
        </button>
      </div>

      {/* TAB 1: CENTRO DE CONTROL & MÉTRICAS */}
      {activeTab === 'control' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-cyan-500/40 transition">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Pendientes por Sincronizar</span>
                <Clock size={20} className="text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{estadisticas.transaccionesPendientes} Transacciones</div>
              <div className="text-xs text-slate-400">Listas para el próximo corte contable</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-emerald-500/40 transition">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Monto Pendiente de Asiento</span>
                <DollarSign size={20} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                ${estadisticas.montoPendiente.toLocaleString('es-CO')} COP
              </div>
              <div className="text-xs text-emerald-300 font-semibold">Conciliado con bancos PSE/Bre-B</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-blue-500/40 transition">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Corte Automático Diario</span>
                <Server size={20} className="text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{configHassql.horaCierreFiscal} hrs</div>
              <div className="text-xs text-slate-400">Daemon de cierre nocturno activo</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-amber-500/40 transition">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Estado Conector HASSQL</span>
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div className="text-xl font-extrabold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                EN LÍNEA
              </div>
              <div className="text-xs text-slate-400 font-mono">hassql.com.co:1433</div>
            </div>
          </div>

          {/* Diagrama de Flujo y Estado de las Imputaciones Contables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Landmark className="text-cyan-400" size={18} />
                Mapeo Contable de Imputaciones Presupuestales HASSQL
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-cyan-400">2.1.2.02.02</span>
                    <div className="font-bold text-white mt-0.5">Multas y Sanciones de Tránsito</div>
                    <p className="text-[11px] text-slate-400">Comparendos CNSV / SIMIT con descuentos aplicados</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    Hacienda Pública
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-cyan-400">2.1.1.01</span>
                    <div className="font-bold text-white mt-0.5">Impuesto Sobre Vehículos Automotores</div>
                    <p className="text-[11px] text-slate-400">Vigencias fiscales actuales y acuerdos de pago</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    Rentas Municipales
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-cyan-400">2.1.2.01</span>
                    <div className="font-bold text-white mt-0.5">Tasas & Derechos de Tránsito / Rodamiento</div>
                    <p className="text-[11px] text-slate-400">Matrículas, licencias de conducción y certificaciones</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    Tesorería
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileCheck2 className="text-cyan-400" size={18} />
                Protocolo de Transmisión & Formato Asobancaria 2001
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                El motor de sincronización de Tránsito Municipal consolida los movimientos de <strong>PSE</strong> y <strong>Bre-B</strong> en un paquete criptográfico con código único de lote y genera el archivo plano bancario <strong>Asobancaria 2001</strong> para garantizar que el saldo en los extractos bancarios coincida al 100% con los libros auxiliares de HASSQL.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1 overflow-x-auto">
                <div className="text-cyan-400 font-bold">// Estructura de Control Asobancaria 2001:</div>
                <div>018901234567TRANSITO0120260813235900A... [Encabezado]</div>
                <div>06TRM-PSE-20260813000000325000000188CUS-ACH-9821... [Detalle]</div>
                <div>0900000001500000000487500000... [Control de Lote]</div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSincronizarLote}
                  disabled={syncing}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Play size={16} /> Forzar Asiento Contable Inmediato en HASSQL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE LOTES */}
      {activeTab === 'historial' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="text-cyan-400" size={18} />
                Lotes de Cierre Fiscal & Asientos en HASSQL
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Historial de conciliaciones diarias enviadas a la plataforma de tesorería municipal.
              </p>
            </div>

            <button
              onClick={cargarLotes}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Código de Lote</th>
                  <th className="p-3.5">Fecha Cierre</th>
                  <th className="p-3.5">N° Transacciones</th>
                  <th className="p-3.5">Recaudo Total</th>
                  <th className="p-3.5">Canales</th>
                  <th className="p-3.5">Comprobante HASSQL</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 rounded-r-xl text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No hay lotes de sincronización registrados aún. Presiona "Sincronizar Lote Diario Ahora".
                    </td>
                  </tr>
                ) : (
                  lotes.map((lote) => (
                    <tr key={lote.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-mono font-bold text-cyan-400">{lote.codigoLote}</td>
                      <td className="p-3.5 text-slate-400">{new Date(lote.createdAt).toLocaleString('es-CO')}</td>
                      <td className="p-3.5 font-bold text-white">{lote.totalTransacciones}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        ${lote.totalRecaudado.toLocaleString('es-CO')}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        PSE: ${(lote.totalPSE || 0).toLocaleString('es-CO')} • Bre-B: ${(lote.totalBreB || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-300">
                        {lote.comprobanteHassqlId || 'CPB-HASSQL-PEND'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            lote.estado === 'EXITOSO'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                          }`}
                        >
                          {lote.estado}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {lote.archivoPlanoGenerado && (
                          <button
                            type="button"
                            onClick={() => descargarArchivoPlano(lote)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-300 text-[10px] font-bold transition inline-flex items-center gap-1"
                            title="Descargar Asobancaria 2001"
                          >
                            <Download size={12} /> Asobancaria
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setLoteDetalle(lote)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition"
                        >
                          Ver Asiento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURACIÓN DEL CONECTOR HASSQL */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="text-cyan-400" size={18} />
                Parámetros de Integración con HASSQL ERP
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configuración del endpoint, base de datos SQL Server y credenciales de acceso para el intercambio de datos contables.
              </p>
            </div>

            <a
              href="https://www.hassql.com.co"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              Documentación HASSQL <ExternalLink size={14} />
            </a>
          </div>

          <form onSubmit={handleGuardarConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Servidor / Host HASSQL *</label>
                <input
                  type="text"
                  required
                  value={configHassql.servidorHost}
                  onChange={(e) => setConfigHassql({ ...configHassql, servidorHost: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  placeholder="https://api.hassql.com.co"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Base de Datos SQL Server *</label>
                <input
                  type="text"
                  required
                  value={configHassql.baseDatos}
                  onChange={(e) => setConfigHassql({ ...configHassql, baseDatos: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Tipo de Protocolo *</label>
                <select
                  value={configHassql.tipoConexion}
                  onChange={(e) => setConfigHassql({ ...configHassql, tipoConexion: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="WEB_SERVICE_REST">REST API JSON (Recomendado)</option>
                  <option value="SOAP_XML">Web Service SOAP / XML</option>
                  <option value="SQL_SERVER_DIRECT">Conexión Directa SQL Server (T-SQL)</option>
                  <option value="ARCHIVO_ASOBANCARIA_2001">Archivo Plano Asobancaria 2001</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Usuario de Servicio *</label>
                <input
                  type="text"
                  required
                  value={configHassql.usuario}
                  onChange={(e) => setConfigHassql({ ...configHassql, usuario: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Contraseña de Integración *</label>
                <input
                  type="password"
                  required
                  value={configHassql.password}
                  onChange={(e) => setConfigHassql({ ...configHassql, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Hora de Cierre Fiscal Diario</label>
                <input
                  type="text"
                  value={configHassql.horaCierreFiscal}
                  onChange={(e) => setConfigHassql({ ...configHassql, horaCierreFiscal: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  placeholder="23:59"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Código Entidad en HASSQL</label>
                <input
                  type="text"
                  value={configHassql.codigoEntidadHassql}
                  onChange={(e) => setConfigHassql({ ...configHassql, codigoEntidadHassql: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Cuenta Bancaria de Recaudo</label>
                <input
                  type="text"
                  value={configHassql.cuentaBancariaRecaudo}
                  onChange={(e) => setConfigHassql({ ...configHassql, cuentaBancariaRecaudo: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Parámetros HASSQL'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Detalle de Asiento Contable */}
      {loteDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="text-cyan-400" size={18} />
                Detalle del Asiento Contable: {loteDetalle.codigoLote}
              </h3>
              <button onClick={() => setLoteDetalle(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Comprobante HASSQL:</span>
                  <div className="font-mono font-bold text-amber-400 mt-0.5">{loteDetalle.comprobanteHassqlId}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Total Asentado:</span>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    ${loteDetalle.totalRecaudado.toLocaleString('es-CO')} COP
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold">Imputaciones Contables Registradas:</span>
                <div className="mt-2 space-y-2">
                  {loteDetalle.detallesContables ? (
                    JSON.parse(loteDetalle.detallesContables).map((imp: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-cyan-400">{imp.codigoContable}</span>
                          <div className="text-slate-200">{imp.descripcionCuenta}</div>
                          <span className="text-[10px] text-slate-500">{imp.cantidadMovimientos} movimientos</span>
                        </div>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          ${imp.totalCredito.toLocaleString('es-CO')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">Sin desglose disponible</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLoteDetalle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
