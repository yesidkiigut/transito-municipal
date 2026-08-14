import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import {
  liquidacionService,
  EstadoCuentaResponse,
} from '@/features/impuestos/services/liquidacionService';
import { BeneficiosCountdownBanner } from '@/features/beneficios/BeneficiosCountdownBanner';
import {
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  Clock,
  Car,
  User,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const EstadoCuentaPage: React.FC = () => {
  const { config } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [criterio, setCriterio] = useState<string>(user?.email === 'ciudadano@gmail.com' ? '1020304050' : 'XYZ789');
  const [tipoBusqueda, setTipoBusqueda] = useState<'documento' | 'placa'>('placa');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'cronograma' | 'comparendos' | 'impuestos' | 'acuerdos'>('cronograma');

  // Estado para simulación de curso pedagógico en comparendos
  const [aplicaCurso, setAplicaCurso] = useState<Record<string, boolean>>({});

  const handleBuscar = async (busquedaManual?: string) => {
    const valor = busquedaManual || criterio;
    if (!valor.trim()) {
      setError('Por favor ingresa una placa o número de documento.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isPlaca = valor.trim().length <= 6 && !/^\d+$/.test(valor.trim());
      const res = await liquidacionService.obtenerEstadoCuenta({
        placa: isPlaca ? valor.trim().toUpperCase() : undefined,
        ciudadanoId: !isPlaca ? valor.trim() : undefined,
        meses: 12,
      });
      setEstadoCuenta(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo consultar el estado de cuenta.');
      setEstadoCuenta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleBuscar();
  }, []);

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
            <Layers size={14} /> Motor de Liquidación Normativa
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Estado de Cuenta & Desglose Mensual
          </h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
            Consolidación integral de obligaciones vehiculares, comparendos de tránsito e intereses moratorios calculados automáticamente según las normativas y tasas vigentes de la Superfinanciera.
          </p>
        </div>

        {/* Barra de Búsqueda */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={criterio}
              onChange={(e) => setCriterio(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="Buscar por Placa (ej: XYZ789) o Cédula (ej: 1020304050)..."
              className="w-full bg-slate-950/80 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm font-medium tracking-wide placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => handleBuscar()}
            disabled={loading}
            style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search size={18} />
                <span>Liquidar Estado de Cuenta</span>
              </>
            )}
          </button>
        </div>

        {/* Chips de Búsqueda Rápida */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>Ejemplos rápidos:</span>
          <button
            onClick={() => {
              setCriterio('XYZ789');
              handleBuscar('XYZ789');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Placa XYZ789
          </button>
          <button
            onClick={() => {
              setCriterio('1020304050');
              handleBuscar('1020304050');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Cédula 1020304050
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {estadoCuenta && (
        <>
          {/* Identificación del Ciudadano / Vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estadoCuenta.vehiculo && (
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
                  <Car size={28} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Vehículo Consultado</div>
                  <div className="text-xl font-extrabold text-white tracking-wide">
                    {estadoCuenta.vehiculo.placa}
                  </div>
                  <div className="text-xs text-slate-400">
                    {estadoCuenta.vehiculo.marca} {estadoCuenta.vehiculo.linea} (Modelo {estadoCuenta.vehiculo.modelo})
                  </div>
                </div>
              </div>
            )}

            {estadoCuenta.ciudadano && (
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                  <User size={28} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Titular / Ciudadano</div>
                  <div className="text-xl font-extrabold text-white">
                    {estadoCuenta.ciudadano.nombreCompleto}
                  </div>
                  <div className="text-xs text-slate-400">
                    Doc: {estadoCuenta.ciudadano.numeroDocumento}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Banner de Pronto Pago y Cuenta Regresiva Automática */}
          {estadoCuenta.comparendos.length > 0 ? (
            <BeneficiosCountdownBanner
              tipoConcepto="COMPARENDO"
              referenciaId={estadoCuenta.comparendos[0].numeroComparendo}
              onPagar={() => navigate('/pagos')}
            />
          ) : estadoCuenta.vehiculo ? (
            <BeneficiosCountdownBanner
              tipoConcepto="IMPUESTO_VEHICULAR"
              referenciaId={estadoCuenta.vehiculo.placa}
              onPagar={() => navigate('/pagos')}
            />
          ) : null}

          {/* KPI Cards Financieras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="text-xs text-slate-400 font-semibold uppercase">Capital Base</div>
              <div className="text-2xl font-black text-white mt-1">
                {formatCOP(estadoCuenta.resumenFinanciero.totalCapital)}
              </div>
              <div className="text-xs text-slate-500 mt-2">Monto nominal sin recargos</div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1.5">
                <Clock size={14} /> Intereses de Mora
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                +{formatCOP(estadoCuenta.resumenFinanciero.totalInteresesMora)}
              </div>
              <div className="text-xs text-amber-500/80 mt-2">Calculados mes a mes por tasa legal</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="text-xs text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
                <Percent size={14} /> Descuentos Vigentes
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                -{formatCOP(estadoCuenta.resumenFinanciero.totalDescuentosVigentes)}
              </div>
              <div className="text-xs text-emerald-500/80 mt-2">Pronto pago / Ley 769</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 p-5 rounded-2xl relative overflow-hidden shadow-xl">
              <div className="text-xs text-cyan-300 font-bold uppercase">Total Neto Exigible</div>
              <div className="text-2xl font-black text-white mt-1 drop-shadow">
                {formatCOP(estadoCuenta.resumenFinanciero.totalNetoPagar)}
              </div>
              <div className="text-xs text-cyan-400/80 mt-2 flex items-center gap-1 font-medium">
                <ShieldCheck size={14} /> Liquidación Oficial al Día
              </div>
            </div>
          </div>

          {/* Acciones de Pago y Refinanciación */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              ¿Deseas cancelar la totalidad de la deuda o diferirla en cuotas mensuales?
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() =>
                  navigate('/acuerdos-pago', {
                    state: {
                      montoTotal: estadoCuenta.resumenFinanciero.totalNetoPagar,
                      placa: estadoCuenta.vehiculo?.placa,
                      ciudadanoId: estadoCuenta.ciudadano?.id,
                    },
                  })
                }
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <Layers size={16} className="text-cyan-400" />
                <span>Diferir en Cuotas</span>
              </button>

              <button
                onClick={() => navigate('/pagos')}
                style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-slate-950 font-bold text-sm shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <CreditCard size={16} />
                <span>Pagar con PSE / Bre-B</span>
              </button>
            </div>
          </div>

          {/* Tabs de Detalle */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex border-b border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('cronograma')}
                className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'cronograma'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar size={18} />
                <span>Cronograma y Evolución Mensual ({estadoCuenta.cronogramaMensual.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('comparendos')}
                className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'comparendos'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertCircle size={18} />
                <span>Comparendos de Tránsito ({estadoCuenta.comparendos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('impuestos')}
                className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'impuestos'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign size={18} />
                <span>Impuesto Vehicular ({estadoCuenta.impuestos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('acuerdos')}
                className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'acuerdos'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={18} />
                <span>Cuotas de Financiación ({estadoCuenta.cuotasAcuerdos.length})</span>
              </button>
            </div>

            <div className="p-6">
              {/* TAB 1: CRONOGRAMA MENSUAL */}
              {activeTab === 'cronograma' && (
                <div className="space-y-4">
                  <div className="text-sm text-slate-400 mb-2">
                    Evolución mensual histórica y acumulada de las obligaciones con corte a cada período fiscal:
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                          <th className="py-3 px-4">Período / Mes</th>
                          <th className="py-3 px-4 text-right">Capital Acumulado</th>
                          <th className="py-3 px-4 text-right">Interés de Mora del Mes</th>
                          <th className="py-3 px-4 text-right">Saldo Proyectado al Período</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {estadoCuenta.cronogramaMensual.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                              <Calendar size={14} className="text-cyan-400" />
                              {item.nombreMes || item.mesAnio}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {formatCOP(item.capitalAcumulado)}
                            </td>
                            <td className="py-3 px-4 text-right text-amber-400 font-medium">
                              +{formatCOP(item.interesMoraMes)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-cyan-400">
                              {formatCOP(item.saldoTotalPeriodo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPARENDOS */}
              {activeTab === 'comparendos' && (
                <div className="space-y-4">
                  {estadoCuenta.comparendos.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
                      <p>No se registran comparendos pendientes ni en mora.</p>
                    </div>
                  ) : (
                    estadoCuenta.comparendos.map((cmp) => (
                      <div
                        key={cmp.id}
                        className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">
                              Comparendo {cmp.numeroComparendo}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {cmp.estado}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Placa: <strong className="text-slate-200">{cmp.placa}</strong> • Fecha:{' '}
                            {new Date(cmp.fechaInfraccion).toLocaleDateString('es-CO')}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-right">
                          <div>
                            <div className="text-xs text-slate-400">Valor Base</div>
                            <div className="font-semibold text-slate-200">{formatCOP(cmp.valorBase)}</div>
                          </div>

                          {cmp.descuentoLey > 0 && (
                            <div>
                              <div className="text-xs text-emerald-400">Descuento Ley</div>
                              <div className="font-semibold text-emerald-400">-{formatCOP(cmp.descuentoLey)}</div>
                            </div>
                          )}

                          {cmp.interesesMora > 0 && (
                            <div>
                              <div className="text-xs text-amber-400">Intereses Mora</div>
                              <div className="font-semibold text-amber-400">+{formatCOP(cmp.interesesMora)}</div>
                            </div>
                          )}

                          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
                            <div className="text-xs text-cyan-300 font-bold">Total a Pagar</div>
                            <div className="text-lg font-extrabold text-cyan-400">{formatCOP(cmp.totalPagar)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: IMPUESTO VEHICULAR */}
              {activeTab === 'impuestos' && (
                <div className="space-y-4">
                  {estadoCuenta.impuestos.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
                      <p>El vehículo se encuentra a paz y salvo de impuesto vehicular.</p>
                    </div>
                  ) : (
                    estadoCuenta.impuestos.map((imp) => (
                      <div
                        key={imp.id}
                        className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">
                              Impuesto Vehicular Vigencia {imp.vigenciaFiscal}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {imp.estado}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Avalúo Comercial: <strong className="text-slate-200">{formatCOP(imp.avaluoComercial)}</strong>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-right">
                          <div>
                            <div className="text-xs text-slate-400">Valor Base</div>
                            <div className="font-semibold text-slate-200">{formatCOP(imp.valorBase)}</div>
                          </div>

                          {imp.descuento > 0 && (
                            <div>
                              <div className="text-xs text-emerald-400">Pronto Pago</div>
                              <div className="font-semibold text-emerald-400">-{formatCOP(imp.descuento)}</div>
                            </div>
                          )}

                          {imp.sancion > 0 && (
                            <div>
                              <div className="text-xs text-amber-400">Sanción Extemp.</div>
                              <div className="font-semibold text-amber-400">+{formatCOP(imp.sancion)}</div>
                            </div>
                          )}

                          {imp.interesesMora > 0 && (
                            <div>
                              <div className="text-xs text-amber-400">Intereses Mora</div>
                              <div className="font-semibold text-amber-400">+{formatCOP(imp.interesesMora)}</div>
                            </div>
                          )}

                          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
                            <div className="text-xs text-cyan-300 font-bold">Total a Pagar</div>
                            <div className="text-lg font-extrabold text-cyan-400">{formatCOP(imp.totalPagar)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: ACUERDOS */}
              {activeTab === 'acuerdos' && (
                <div className="space-y-4">
                  {estadoCuenta.cuotasAcuerdos.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Layers size={40} className="mx-auto text-slate-600 mb-2" />
                      <p>No tienes cuotas activas de acuerdos de pago diferido.</p>
                      <button
                        onClick={() => navigate('/acuerdos-pago')}
                        className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-semibold border border-slate-700 transition"
                      >
                        Crear nuevo Acuerdo de Financiación
                      </button>
                    </div>
                  ) : (
                    estadoCuenta.cuotasAcuerdos.map((cuota) => (
                      <div
                        key={cuota.id}
                        className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white text-base">
                            {cuota.codigoAcuerdo} • Cuota #{cuota.numeroCuota}
                          </div>
                          <div className="text-xs text-slate-400">
                            Vencimiento: {new Date(cuota.fechaVencimiento).toLocaleDateString('es-CO')}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="text-xs text-slate-400">Capital: {formatCOP(cuota.valorCapital)}</div>
                            <div className="text-xs text-slate-400">Interés: {formatCOP(cuota.valorInteres)}</div>
                          </div>
                          <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
                            <div className="text-xs text-cyan-300 font-bold">Total Cuota</div>
                            <div className="text-lg font-extrabold text-cyan-400">
                              {formatCOP(cuota.valorTotalCuota)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
