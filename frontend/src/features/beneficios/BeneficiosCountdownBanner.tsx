import React, { useState, useEffect } from 'react';
import { liquidacionService } from '@/features/impuestos/services/liquidacionService';
import {
  Clock,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GraduationCap,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  TrendingDown
} from 'lucide-react';

interface BeneficiosCountdownBannerProps {
  tipoConcepto: 'COMPARENDO' | 'IMPUESTO_VEHICULAR';
  referenciaId: string;
  onPagar?: () => void;
}

export const BeneficiosCountdownBanner: React.FC<BeneficiosCountdownBannerProps> = ({
  tipoConcepto,
  referenciaId,
  onPagar,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [realizoCurso, setRealizoCurso] = useState<boolean>(true);

  const cargarTramos = async () => {
    setLoading(true);
    try {
      const res = await liquidacionService.consultarTramosBeneficio({
        tipoConcepto,
        referenciaId,
        realizoCurso,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTramos();
  }, [referenciaId, realizoCurso]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center text-slate-400 animate-pulse">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Calculando reloj de beneficios y plazos de ley...</span>
      </div>
    );
  }

  if (!data || !data.tramoVigenteActual) return null;

  const tramoActual = data.tramoVigenteActual;
  const esMora = tramoActual.estado === 'EN_MORA';
  const tieneDescuento = tramoActual.porcentajeDescuento > 0;

  return (
    <div className="space-y-4">
      {/* Banner Principal de Cuenta Regresiva */}
      <div
        className={`rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all duration-300 ${
          esMora
            ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/80 border-rose-500/40'
            : tieneDescuento
            ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border-emerald-500/40'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Lado Izquierdo: Cuenta Regresiva y Ahorro */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {tieneDescuento ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black tracking-wide uppercase shadow-sm animate-pulse">
                  <Flame size={14} className="text-emerald-400" />
                  Beneficio de Pronto Pago Activo
                </span>
              ) : esMora ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black tracking-wide uppercase shadow-sm">
                  <AlertTriangle size={14} className="text-rose-400" />
                  Plazo Expirado • Generando Intereses de Mora
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase">
                  Tarifa Plena Sin Mora
                </span>
              )}

              {tipoConcepto === 'COMPARENDO' && (
                <label className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={realizoCurso}
                    onChange={(e) => setRealizoCurso(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-0 accent-cyan-500"
                  />
                  <GraduationCap size={14} className="text-cyan-400" />
                  <span>Realicé Curso Pedagógico (Ley 769)</span>
                </label>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {tieneDescuento ? (
                  <>
                    <span>¡Ahorras {formatCOP(tramoActual.montoDescuento)}</span>
                    <span className="text-emerald-400 font-extrabold">({tramoActual.porcentajeDescuento}%)!</span>
                  </>
                ) : esMora ? (
                  <span className="text-rose-300">Obligación con recargos de mora</span>
                ) : (
                  <span>Pago con Tarifa Plena</span>
                )}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                {tramoActual.nombre}.{' '}
                {tramoActual.fechaLimite && (
                  <>
                    Válido hasta el{' '}
                    <strong className="text-white font-bold">
                      {new Date(tramoActual.fechaLimite).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Lado Derecho: Reloj de Cuenta Regresiva y Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
            {tramoActual.fechaLimite && (
              <div className="text-center sm:text-right pr-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1 justify-center sm:justify-end">
                  <Clock size={13} className="text-cyan-400" />
                  <span>Tiempo Restante:</span>
                </div>
                <div className="text-2xl font-black text-white mt-0.5 tracking-tight flex items-baseline gap-1">
                  <span className="text-emerald-400 font-extrabold">{tramoActual.diasHabilesRestantes}</span>
                  <span className="text-xs text-slate-400 font-normal">días hábiles</span>
                  <span className="text-xs text-slate-600">/</span>
                  <span className="text-sm text-slate-300">{tramoActual.diasCalendarioRestantes}d</span>
                </div>
              </div>
            )}

            <div className="text-right">
              <div className="text-xs text-slate-400">Total a Pagar Hoy</div>
              <div className="text-2xl font-black text-cyan-400">{formatCOP(tramoActual.totalPagar)}</div>
            </div>

            {onPagar && (
              <button
                onClick={onPagar}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg hover:opacity-90 active:scale-95 transition whitespace-nowrap"
              >
                Pagar con Ahorro
              </button>
            )}
          </div>
        </div>

        {/* Stepper / Timeline de los 4 Tramos */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Línea de Tiempo de Beneficios y Plazos Legales
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.tramosDisponibles?.map((tr: any, idx: number) => {
              const isCurrent = tr.esTramoActual;
              const isExpired = tr.estado === 'EXPIRADO';
              const isMoraItem = tr.codigoRegla === 'PERIODO_MORA' || tr.codigoRegla === 'EXTEMPORANEIDAD_MORA';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition relative ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30'
                      : isExpired
                      ? 'bg-slate-950/40 border-slate-800 opacity-60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-extrabold text-slate-300">Tramo {tr.numeroTramo}</span>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-slate-950">
                        ACTIVO HOY
                      </span>
                    ) : isExpired ? (
                      <span className="text-[10px] font-semibold text-slate-500">Expirado</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Próximo</span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-white truncate">{tr.nombre}</div>

                  <div className="mt-2 flex items-baseline justify-between text-xs border-t border-slate-800/60 pt-2">
                    <span className="text-slate-400">Total:</span>
                    <span className={`font-black ${isCurrent ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {formatCOP(tr.totalPagar)}
                    </span>
                  </div>

                  {tr.montoDescuento > 0 && (
                    <div className="text-[11px] text-emerald-400 flex justify-between mt-0.5">
                      <span>Ahorras:</span>
                      <span className="font-bold">-{formatCOP(tr.montoDescuento)}</span>
                    </div>
                  )}

                  {tr.interesesMora > 0 && (
                    <div className="text-[11px] text-rose-400 flex justify-between mt-0.5">
                      <span>Recargo mora:</span>
                      <span className="font-bold">+{formatCOP(tr.interesesMora)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
