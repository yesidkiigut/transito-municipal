import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import {
  Landmark,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  CreditCard,
  Layers,
  FileCheck2,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  Printer,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface TransaccionTesoreria {
  id: string;
  referenciaPago: string;
  ciudadanoId: string;
  montoTotal: number;
  canalPago: 'PSE' | 'BRE_B' | 'TARJETA' | 'VENTANILLA';
  proveedorPasarela: string;
  estadoPago: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'EXPIRADO';
  cus?: string;
  codigoTrazabilidad?: string;
  bancoPSE?: string;
  sincronizadoHassql: boolean;
  fechaSincronizacion?: string;
  referenciaAsientoHassql?: string;
  reciboOficialNumero?: string;
  fechaTransaccion: string;
  fechaAprobacion?: string;
  detalles: Array<{
    id: string;
    tipoConcepto: string;
    referenciaConcepto: string;
    descripcion: string;
    codigoContable: string;
    valorBase: number;
    descuento: number;
    interesesMora: number;
    valorFinal: number;
  }>;
}

export const TesoreriaPage: React.FC = () => {
  const { config } = useThemeStore();

  const [loading, setLoading] = useState(false);
  const [transacciones, setTransacciones] = useState<TransaccionTesoreria[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [reintentando, setReintentando] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCanal, setFiltroCanal] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroSyncHassql, setFiltroSyncHassql] = useState('TODOS');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Métricas
  const [metricas, setMetricas] = useState({
    totalRegistros: 0,
    montoTotalFiltrado: 0,
    montoAprobadoRecaudado: 0,
    totalPSE: 0,
    totalBreB: 0,
    totalSincronizadasHassql: 0,
    tasaSincronizacion: 100,
  });

  // Modal de Detalle de Transacción y Acta de Cierre
  const [transaccionDetalle, setTransaccionDetalle] = useState<TransaccionTesoreria | null>(null);
  const [modalActaOpen, setModalActaOpen] = useState(false);
  const [actaData, setActaData] = useState<any>(null);
  const [cargandoActa, setCargandoActa] = useState(false);

  useEffect(() => {
    cargarConciliacion();
  }, [filtroCanal, filtroEstado, filtroSyncHassql, fechaDesde, fechaHasta]);

  const cargarConciliacion = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.set('busqueda', busqueda);
      if (filtroCanal !== 'TODOS') params.set('canal', filtroCanal);
      if (filtroEstado !== 'TODOS') params.set('estado', filtroEstado);
      if (filtroSyncHassql !== 'TODOS') params.set('syncHassql', filtroSyncHassql);
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);

      const res = await fetch(`/api/v1/tesoreria/conciliacion?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTransacciones(data.transacciones || []);
        if (data.metricas) setMetricas(data.metricas);
      }
    } catch (err) {
      toast.error('Error al cargar datos de tesorería y conciliación');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarConciliacion();
  };

  const toggleSeleccion = (id: string) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((i) => i !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  const toggleSeleccionarTodo = () => {
    if (seleccionadas.length === transacciones.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(transacciones.map((t) => t.id));
    }
  };

  const handleReintentarSync = async () => {
    if (seleccionadas.length === 0) {
      toast.error('Selecciona al menos una transacción');
      return;
    }

    setReintentando(true);
    try {
      const res = await fetch('/api/v1/tesoreria/reintentar-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaccionIds: seleccionadas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en reintento');

      toast.success('Sincronización masiva con HASSQL procesada correctamente');
      setSeleccionadas([]);
      cargarConciliacion();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar reintento');
    } finally {
      setReintentando(false);
    }
  };

  const handleGenerarActaCierre = async () => {
    setCargandoActa(true);
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const res = await fetch(`/api/v1/tesoreria/reporte-cierre?fecha=${fechaDesde || hoy}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar acta');

      setActaData(data);
      setModalActaOpen(true);
    } catch (err: any) {
      toast.error('Error al emitir el acta de cierre');
    } finally {
      setCargandoActa(false);
    }
  };

  const exportarCSV = () => {
    if (transacciones.length === 0) {
      toast.error('No hay transacciones para exportar');
      return;
    }

    const encabezados = [
      'Referencia Pago',
      'CUS / Trazabilidad',
      'Fecha',
      'Canal',
      'Monto Total',
      'Estado Pago',
      'Recibo Oficial',
      'Sincronizado HASSQL',
      'Comprobante HASSQL',
    ];

    const filas = transacciones.map((t) => [
      t.referenciaPago,
      t.cus || t.codigoTrazabilidad || '',
      new Date(t.fechaTransaccion).toISOString(),
      t.canalPago,
      t.montoTotal,
      t.estadoPago,
      t.reciboOficialNumero || '',
      t.sincronizadoHassql ? 'SI' : 'NO',
      t.referenciaAsientoHassql || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [encabezados.join(','), ...filas.map((f) => f.map((v) => `"${v}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CONCILIACION_TESORERIA_TRANSITO_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Archivo CSV de conciliación exportado');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/70 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-3.5 py-1 rounded-full shadow-inner">
              <Landmark size={14} className="text-cyan-400" /> Módulo de Tesorería, Auditoría & Conciliación
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Control de Recaudos & Conciliación Bancaria
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Arqueo en tiempo real de recaudos bancarios multicanal (<strong>PSE ACH</strong> y <strong>Bre-B Banco de la República</strong>), auditoría de CUS y validación cruzada con el sistema contable <strong>HASSQL</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportarCSV}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
            >
              <Download size={15} /> Exportar CSV / HASSQL
            </button>

            <button
              type="button"
              onClick={handleGenerarActaCierre}
              disabled={cargandoActa}
              style={{
                background: `linear-gradient(to right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'})`,
              }}
              className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 active:scale-95"
            >
              <FileCheck2 size={16} /> {cargandoActa ? 'Generando Acta...' : 'Emitir Acta de Cierre Diario'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards de Arqueo de Recaudo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-emerald-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Total Recaudado Aprobado</span>
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${metricas.montoAprobadoRecaudado.toLocaleString('es-CO')} COP
          </div>
          <div className="text-xs text-slate-400">{metricas.totalRegistros} movimientos registrados</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-blue-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Recaudo Canal PSE</span>
            <CreditCard size={20} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400 font-mono">
            ${metricas.totalPSE.toLocaleString('es-CO')} COP
          </div>
          <div className="text-xs text-slate-400">Débito automático ACH Colombia</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Recaudo Canal Bre-B</span>
            <QrCode size={20} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            ${metricas.totalBreB.toLocaleString('es-CO')} COP
          </div>
          <div className="text-xs text-slate-400">Pagos inmediatos Banco de la República</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-cyan-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Asiento Contable HASSQL</span>
            <Building2 size={20} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {metricas.tasaSincronizacion}%
          </div>
          <div className="text-xs text-slate-400 font-semibold">{metricas.totalSincronizadasHassql} transacciones en libros</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <form onSubmit={handleBuscar} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={16} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por CUS, Referencia, Recibo..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={filtroCanal}
              onChange={(e) => setFiltroCanal(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Todos los Canales</option>
              <option value="PSE">Canal PSE (ACH)</option>
              <option value="BRE_B">Canal Bre-B (BanRep)</option>
            </select>
          </div>

          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="APROBADO">Aprobados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
          </div>

          <div>
            <select
              value={filtroSyncHassql}
              onChange={(e) => setFiltroSyncHassql(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Estado en HASSQL</option>
              <option value="true">Sincronizados</option>
              <option value="false">Pendientes de Sync</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5"
            >
              <Filter size={14} /> Filtrar
            </button>
            <button
              type="button"
              onClick={cargarConciliacion}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Recargar datos"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Movimientos y Conciliación */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="text-cyan-400" size={18} />
              Movimientos de Recaudo Diario
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({transacciones.length} registros)
            </span>
          </div>

          {seleccionadas.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-300 font-bold">
                {seleccionadas.length} seleccionadas
              </span>
              <button
                type="button"
                onClick={handleReintentarSync}
                disabled={reintentando}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <RefreshCw size={13} className={reintentando ? 'animate-spin' : ''} />
                Forzar Sync HASSQL
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl w-10 text-center">
                  <input
                    type="checkbox"
                    checked={seleccionadas.length === transacciones.length && transacciones.length > 0}
                    onChange={toggleSeleccionarTodo}
                    className="accent-cyan-500 rounded cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Referencia / CUS</th>
                <th className="p-3.5">Fecha & Hora</th>
                <th className="p-3.5">Canal</th>
                <th className="p-3.5">Conceptos</th>
                <th className="p-3.5">Monto Total</th>
                <th className="p-3.5">Estado Pago</th>
                <th className="p-3.5">HASSQL</th>
                <th className="p-3.5 rounded-r-xl text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {transacciones.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                transacciones.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={seleccionadas.includes(t.id)}
                        onChange={() => toggleSeleccion(t.id)}
                        className="accent-cyan-500 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-cyan-400">{t.referenciaPago}</div>
                      <div className="text-[10px] text-slate-500 font-mono">CUS: {t.cus || t.codigoTrazabilidad || 'N/A'}</div>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(t.fechaTransaccion).toLocaleString('es-CO')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.canalPago === 'BRE_B'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}
                      >
                        {t.canalPago}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white text-[11px]">
                        {t.detalles.length > 0 ? t.detalles[0].descripcion : 'Conceptos de Tránsito'}
                      </div>
                      {t.detalles.length > 1 && (
                        <span className="text-[10px] text-cyan-400">+{t.detalles.length - 1} concepto(s) más</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      ${t.montoTotal.toLocaleString('es-CO')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.estadoPago === 'APROBADO'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : t.estadoPago === 'PENDIENTE'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}
                      >
                        {t.estadoPago}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {t.sincronizadoHassql ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> {t.referenciaAsientoHassql || 'Asentado'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Clock size={13} /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setTransaccionDetalle(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition"
                      >
                        Auditar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Auditoría */}
      {transaccionDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-cyan-400" size={18} />
                Auditoría de Transacción: {transaccionDetalle.referenciaPago}
              </h3>
              <button onClick={() => setTransaccionDetalle(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">CUS / Trazabilidad:</span>
                  <div className="font-mono font-bold text-cyan-400 mt-0.5">{transaccionDetalle.cus || transaccionDetalle.codigoTrazabilidad}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Canal & Proveedor:</span>
                  <div className="font-bold text-white mt-0.5">{transaccionDetalle.canalPago} ({transaccionDetalle.proveedorPasarela})</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Monto Total:</span>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    ${transaccionDetalle.montoTotal.toLocaleString('es-CO')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Recibo Oficial:</span>
                  <div className="font-mono text-slate-200 mt-0.5">{transaccionDetalle.reciboOficialNumero || 'Pendiente'}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Asiento HASSQL:</span>
                  <div className="font-mono text-amber-300 mt-0.5">{transaccionDetalle.referenciaAsientoHassql || 'En cola de lote'}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Fecha / Hora:</span>
                  <div className="text-slate-300 mt-0.5">{new Date(transaccionDetalle.fechaTransaccion).toLocaleString('es-CO')}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Conceptos Liquidados en la Transacción:</span>
                <div className="mt-2 space-y-2">
                  {transaccionDetalle.detalles.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-cyan-400">{d.codigoContable}</span>
                        <div className="text-slate-200 font-bold">{d.descripcion}</div>
                        <span className="text-[10px] text-slate-500 font-mono">Ref: {d.referenciaConcepto}</span>
                      </div>
                      <div className="text-right">
                        {d.descuento > 0 && (
                          <div className="text-[10px] text-emerald-400">Dto Ley: -${d.descuento.toLocaleString('es-CO')}</div>
                        )}
                        <div className="font-mono font-bold text-white">${d.valorFinal.toLocaleString('es-CO')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTransaccionDetalle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Acta de Cierre Fiscal Oficial */}
      {modalActaOpen && actaData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REPÚBLICA DE COLOMBIA</span>
                <h2 className="text-lg font-extrabold text-white">{actaData.entidad.municipio}</h2>
                <p className="text-xs text-slate-400">{actaData.entidad.secretaria} • NIT: {actaData.entidad.nit}</p>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-cyan-400 text-sm">{actaData.actaNumero}</span>
                <p className="text-[10px] text-slate-500">Fecha Cierre: {actaData.fechaCierre}</p>
              </div>
            </div>

            {/* Resumen de Caja */}
            <div className="grid grid-cols-3 gap-4 text-xs p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Recaudado:</span>
                <div className="font-mono font-extrabold text-emerald-400 text-lg mt-0.5">
                  ${actaData.resumenCaja.totalRecaudado.toLocaleString('es-CO')} COP
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Canal PSE ACH:</span>
                <div className="font-mono font-bold text-blue-400 text-sm mt-0.5">
                  ${actaData.resumenCaja.totalPSE.toLocaleString('es-CO')}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Canal Bre-B (BanRep):</span>
                <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                  ${actaData.resumenCaja.totalBreB.toLocaleString('es-CO')}
                </div>
              </div>
            </div>

            {/* Imputación por Conceptos */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">Desglose por Concepto Presupuestal:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500">Multas / Comparendos:</span>
                  <div className="font-mono font-bold text-white mt-0.5">
                    ${actaData.desgloseConceptos.multasComparendos.toLocaleString('es-CO')}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500">Impuesto Vehicular:</span>
                  <div className="font-mono font-bold text-white mt-0.5">
                    ${actaData.desgloseConceptos.impuestoVehicular.toLocaleString('es-CO')}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500">Rodamiento Municipal:</span>
                  <div className="font-mono font-bold text-white mt-0.5">
                    ${actaData.desgloseConceptos.rodamientoMunicipal.toLocaleString('es-CO')}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500">Derechos de Trámite:</span>
                  <div className="font-mono font-bold text-white mt-0.5">
                    ${actaData.desgloseConceptos.derechosTramites.toLocaleString('es-CO')}
                  </div>
                </div>
              </div>
            </div>

            {/* Hash Criptográfico y Firmas */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-400">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">Sello Digital de Seguridad (Hash Cierre):</span>
                <span className="font-mono text-cyan-400 text-[10px]">{actaData.hashCriptograficoVerificacion}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Certifica que todos los fondos recaudados corresponden a débitos aprobados e integrados en los libros de Tesorería Municipal de HASSQL.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <Printer size={15} /> Imprimir Acta Oficial
              </button>
              <button
                type="button"
                onClick={() => setModalActaOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
