import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import {
  liquidacionService,
  SimulacionAcuerdoResponse,
  CuotaSimulada,
} from '@/features/impuestos/services/liquidacionService';
import {
  Layers,
  Sliders,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  CreditCard,
  Percent,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const AcuerdosPagoPage: React.FC = () => {
  const { config } = useThemeStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Si viene desde Estado de Cuenta con estado precargado
  const stateData = location.state as { montoTotal?: number; placa?: string; ciudadanoId?: string } | null;

  const [activeTab, setActiveTab] = useState<'simulador' | 'mis-acuerdos'>('simulador');

  // Parámetros de simulación
  const [montoTotal, setMontoTotal] = useState<number>(stateData?.montoTotal || 1850000);
  const [porcentajeInicial, setPorcentajeInicial] = useState<number>(20);
  const [numeroCuotas, setNumeroCuotas] = useState<number>(6);
  const [tasaInteres, setTasaInteres] = useState<number>(1.2);
  const [placa, setPlaca] = useState<string>(stateData?.placa || 'XYZ789');

  const [simulacion, setSimulacion] = useState<SimulacionAcuerdoResponse | null>(null);
  const [loadingSimulacion, setLoadingSimulacion] = useState<boolean>(false);
  const [creatingAcuerdo, setCreatingAcuerdo] = useState<boolean>(false);
  const [acuerdoCreadoExito, setAcuerdoCreadoExito] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lista de acuerdos
  const [acuerdosList, setAcuerdosList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  const handleSimular = async () => {
    if (montoTotal <= 0) return;
    setLoadingSimulacion(true);
    setError(null);

    try {
      const res = await liquidacionService.simularAcuerdoPago({
        montoTotal,
        porcentajeInicial,
        numeroCuotas,
        tasaInteres,
      });
      setSimulacion(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al simular amortización.');
    } finally {
      setLoadingSimulacion(false);
    }
  };

  const handleCargarAcuerdos = async () => {
    setLoadingList(true);
    try {
      const res = await liquidacionService.listarAcuerdos({
        ciudadanoId: user?.rol === 'CIUDADANO' ? user.id : undefined,
      });
      setAcuerdosList(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    handleSimular();
  }, [montoTotal, porcentajeInicial, numeroCuotas, tasaInteres]);

  useEffect(() => {
    if (activeTab === 'mis-acuerdos') {
      handleCargarAcuerdos();
    }
  }, [activeTab]);

  const handleFormalizarAcuerdo = async () => {
    if (!simulacion) return;
    setCreatingAcuerdo(true);
    setError(null);

    try {
      const res = await liquidacionService.crearAcuerdoPago({
        ciudadanoId: user?.id || 'ciudadano-default-id',
        placaVehiculo: placa,
        montoTotalDeuda: montoTotal,
        porcentajeInicial,
        numeroCuotas,
        tasaInteresFinanciacion: tasaInteres,
        observaciones: `Acuerdo de pago formalizado en portal digital por ${numeroCuotas} cuotas.`,
      });

      setAcuerdoCreadoExito(res);
      handleCargarAcuerdos();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al formalizar el acuerdo de pago.');
    } finally {
      setCreatingAcuerdo(false);
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sliders size={14} /> Financiación y Facilidades de Pago
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Acuerdos de Pago Diferido en Cuotas
          </h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
            Simula planes de amortización a tu medida con cuotas mensuales fijas, congelamiento de intereses moratorios y expedición instantánea de paz y salvo provisional.
          </p>
        </div>

        {/* Tabs de Navegación */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('simulador');
              setAcuerdoCreadoExito(null);
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'simulador'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sliders size={16} />
            <span>Simulador de Amortización</span>
          </button>

          <button
            onClick={() => setActiveTab('mis-acuerdos')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'mis-acuerdos'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileCheck size={16} />
            <span>Acuerdos Registrados ({acuerdosList.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 1: SIMULADOR DE AMORTIZACIÓN */}
      {/* ======================================================== */}
      {activeTab === 'simulador' && (
        <>
          {acuerdoCreadoExito ? (
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">¡Acuerdo de Pago Formalizado!</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Tu convenio ha sido registrado con el radicado oficial{' '}
                  <strong className="text-cyan-400">{acuerdoCreadoExito.codigoAcuerdo}</strong>.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Monto Total Financiado:</span>
                  <strong className="text-white">{formatCOP(acuerdoCreadoExito.montoTotalDeuda)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cuota Inicial Pagada/Requerida:</span>
                  <strong className="text-emerald-400">{formatCOP(acuerdoCreadoExito.montoCuotaInicial)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Número de Cuotas:</span>
                  <strong className="text-white">{acuerdoCreadoExito.numeroCuotas} meses</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valor Cuota Mensual:</span>
                  <strong className="text-cyan-400 font-bold">{formatCOP(acuerdoCreadoExito.valorCuotaFija)}</strong>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActiveTab('mis-acuerdos')}
                  className="px-6 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-lg hover:opacity-90 transition"
                >
                  Ver Cronograma de Cuotas
                </button>
                <button
                  onClick={() => setAcuerdoCreadoExito(null)}
                  className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition"
                >
                  Nueva Simulación
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Panel de Controles / Sliders (4 columnas) */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Sliders size={20} className="text-cyan-400" />
                  <span>Configura tu Plan de Pago</span>
                </h2>

                {/* Monto Total */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Monto Total de la Deuda</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={montoTotal}
                      onChange={(e) => setMontoTotal(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950/80 border border-slate-700 text-white pl-8 pr-4 py-3 rounded-2xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    />
                  </div>

                  {/* Presets rápidos */}
                  <div className="flex gap-2 text-xs pt-1">
                    {[500000, 1500000, 3000000, 5000000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setMontoTotal(val)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        {formatCOP(val).replace(',00', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuota Inicial % Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 uppercase">Cuota Inicial ({porcentajeInicial}%)</span>
                    <span className="text-emerald-400 font-bold">{formatCOP(montoTotal * (porcentajeInicial / 100))}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={porcentajeInicial}
                    onChange={(e) => setPorcentajeInicial(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>0% (Sin inicial)</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Número de Cuotas (Meses) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 uppercase">Plazo de Financiación</span>
                    <span className="text-cyan-400 font-bold">{numeroCuotas} Meses</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[3, 6, 12, 18, 24].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumeroCuotas(n)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                          numeroCuotas === n
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-105'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {n}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasa de Interés Financiación */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 uppercase">Tasa de Financiación Mensual</span>
                    <span className="text-slate-200 font-bold">{tasaInteres}% M.V.</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={tasaInteres}
                    onChange={(e) => setTasaInteres(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                {/* Placa Opcional */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Placa de Referencia</label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    placeholder="XYZ789"
                    className="w-full bg-slate-950/80 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Panel de Resultados y Tabla de Amortización (7 columnas) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Resumen Superior */}
                {simulacion && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-xs text-slate-400 font-semibold uppercase">Cuota Inicial</div>
                      <div className="text-xl font-black text-emerald-400 mt-1">
                        {formatCOP(simulacion.montoInicial)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Pago de apertura ({simulacion.porcentajeInicial}%)</div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-xs text-slate-400 font-semibold uppercase">Saldo Financiado</div>
                      <div className="text-xl font-black text-white mt-1">
                        {formatCOP(simulacion.saldoFinanciar)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Diferido a {simulacion.numeroCuotas} meses</div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-950/90 to-blue-950/90 border border-cyan-500/40 p-4 rounded-2xl shadow-lg">
                      <div className="text-xs text-cyan-300 font-bold uppercase">Cuota Fija Mensual</div>
                      <div className="text-xl font-black text-white mt-1">
                        {formatCOP(simulacion.cuotas[1]?.valor_total_cuota || 0)}
                      </div>
                      <div className="text-[11px] text-cyan-400/80 mt-1">Capital + Interés corriente</div>
                    </div>
                  </div>
                )}

                {/* Tabla de Amortización */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Calendar size={16} className="text-cyan-400" />
                      <span>Tabla de Amortización Mensual</span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      Sistema Francés (Cuota Fija)
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Cuota</th>
                          <th className="py-2.5 px-3">Vencimiento</th>
                          <th className="py-2.5 px-3 text-right">Capital</th>
                          <th className="py-2.5 px-3 text-right">Interés</th>
                          <th className="py-2.5 px-3 text-right">Total Cuota</th>
                          <th className="py-2.5 px-3 text-right">Saldo Insoluto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {simulacion?.cuotas.map((c) => (
                          <tr
                            key={c.numero_cuota}
                            className={`hover:bg-slate-800/40 transition ${
                              c.numero_cuota === 0 ? 'bg-emerald-950/20 font-bold' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-bold text-white">
                              {c.numero_cuota === 0 ? 'Inicial' : `#${c.numero_cuota}`}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">{c.fecha_vencimiento}</td>
                            <td className="py-2.5 px-3 text-right">{formatCOP(c.valor_capital)}</td>
                            <td className="py-2.5 px-3 text-right text-amber-400/90">{formatCOP(c.valor_interes)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                              {formatCOP(c.valor_total_cuota)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-400">{formatCOP(c.saldo_restante)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Botón de Formalización */}
                  <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleFormalizarAcuerdo}
                      disabled={creatingAcuerdo}
                      style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
                      className="px-6 py-3 rounded-2xl text-slate-950 font-extrabold text-sm shadow-xl hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {creatingAcuerdo ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Formalizar y Radicar Acuerdo de Pago</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: LISTADO DE ACUERDOS REGISTRADOS */}
      {/* ======================================================== */}
      {activeTab === 'mis-acuerdos' && (
        <div className="space-y-4">
          {loadingList ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Cargando acuerdos registrados...</p>
            </div>
          ) : acuerdosList.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
              <Layers size={48} className="mx-auto text-slate-600" />
              <div>
                <h3 className="text-lg font-bold text-white">No tienes acuerdos de pago registrados</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Usa el simulador para proyectar un plan de cuotas y formalizar tu primer acuerdo.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('simulador')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-lg hover:opacity-90 transition"
              >
                Abrir Simulador
              </button>
            </div>
          ) : (
            acuerdosList.map((acuerdo) => (
              <div
                key={acuerdo.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{acuerdo.codigoAcuerdo}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {acuerdo.estado}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Placa: <strong className="text-slate-200">{acuerdo.placaVehiculo || 'N/A'}</strong> • Suscrito el:{' '}
                      {new Date(acuerdo.fechaSuscripcion).toLocaleDateString('es-CO')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Monto Financiado</div>
                    <div className="text-xl font-black text-cyan-400">{formatCOP(acuerdo.montoTotalDeuda)}</div>
                  </div>
                </div>

                {/* Cuotas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Cuota Inicial:</span>
                    <strong className="text-white text-sm">{formatCOP(acuerdo.montoCuotaInicial)}</strong>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Plazo Total:</span>
                    <strong className="text-white text-sm">{acuerdo.numeroCuotas} Cuotas Mensuales</strong>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Cuota Promedio:</span>
                    <strong className="text-cyan-400 text-sm">{formatCOP(acuerdo.valorCuotaFija)}</strong>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Tasa Financiación:</span>
                    <strong className="text-white text-sm">{acuerdo.tasaInteresFinanciacion}% M.V.</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
