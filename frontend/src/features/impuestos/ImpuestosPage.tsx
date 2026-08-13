import React, { useState } from 'react';
import { Landmark, Search, ShieldCheck, CreditCard, RefreshCw, Sparkles, CheckCircle2, ArrowRight, X, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const ImpuestosPage: React.FC = () => {
  const [placaInput, setPlacaInput] = useState('KIG982');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any | null>(null);

  const [pseModalOpen, setPseModalOpen] = useState(false);
  const [impuestoSeleccionado, setImpuestoSeleccionado] = useState<any | null>(null);
  const [bancoCodigo, setBancoCodigo] = useState('BANCOLOMBIA_PSE');
  const [emailPagador, setEmailPagador] = useState('ciudadano@gmail.com');
  const [pagando, setPagando] = useState(false);

  const handleConsultar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!placaInput) {
      toast.error('Ingresa una placa para consultar');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/impuestos/consultar?placa=${placaInput}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al consultar impuesto');

      setResultado(data);
      toast.success(`Liquidación obtenida para placa ${placaInput.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'No se pudo consultar el impuesto');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePagarPSE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impuestoSeleccionado) return;

    setPagando(true);
    try {
      const res = await fetch('/api/v1/pasarela/iniciar-pago-pse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impuestoId: impuestoSeleccionado.id,
          bancoCodigo,
          emailPagador,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar pago PSE');

      toast.success(`¡Pago PSE Exitoso! Referencia: ${data.referenciaPago}`);
      setPseModalOpen(false);
      handleConsultar();
    } catch (err: any) {
      toast.error(err.message || 'Error en pasarela PSE');
    } finally {
      setPagando(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner Header */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-indigo-300 bg-indigo-950/90 border border-indigo-800 px-3.5 py-1 rounded-full">
            <Landmark size={14} className="text-indigo-400" /> Impuesto Vehicular Servicio Público
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            Consulta y Liquidación de Impuesto Vehicular
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Liquidación según la **Ley 488 de 1998**, avalúo comercial del Ministerio de Transporte, cálculo de extemporaneidad (**Art. 641 ET**), intereses de mora y descuentos por pronto pago y traslado de cuenta.
          </p>
        </div>
      </div>

      {/* Buscador de Placa */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Search size={18} className="text-indigo-400" />
          Consultar Placa de Servicio Público o Particular
        </h2>

        <form onSubmit={handleConsultar} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={placaInput}
              onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
              placeholder="Ej. KIG982 o WOK123"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-amber-400 font-mono text-lg font-extrabold tracking-wider uppercase focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
            Consultar Liquidaciones
          </button>
        </form>
      </div>

      {/* Resultado de Liquidación */}
      {resultado && (
        <div className="space-y-6">
          {/* Ficha del Vehículo */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Datos del Vehículo RUNT Municipal</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Placa:</span>
                <div className="font-mono text-base font-extrabold text-amber-400">{resultado.vehiculo.placa}</div>
              </div>
              <div>
                <span className="text-slate-400">Marca y Línea:</span>
                <div className="font-bold text-slate-100">{resultado.vehiculo.marca} {resultado.vehiculo.linea} ({resultado.vehiculo.modelo})</div>
              </div>
              <div>
                <span className="text-slate-400">Clase / Cilindraje:</span>
                <div className="font-bold text-slate-100">{resultado.vehiculo.claseServicio} • {resultado.vehiculo.cilindraje} cc</div>
              </div>
              <div>
                <span className="text-slate-400">Propietario Registrado:</span>
                <div className="font-bold text-slate-100">{resultado.vehiculo.propietario}</div>
              </div>
            </div>
          </div>

          {/* Tarjetas de Liquidación por Vigencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resultado.liquidaciones.map((liq: any) => (
              <div key={liq.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 font-bold">VIGENCIA FISCAL</span>
                    <div className="text-2xl font-extrabold text-white">{liq.vigenciaFiscal}</div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    liq.estado === 'PAGADO' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    liq.estado === 'EN_MORA' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {liq.estado}
                  </span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span>Avalúo Comercial MinTransporte:</span>
                    <span className="font-mono font-bold text-slate-100">${liq.avaluoComercial.toLocaleString()} COP</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span>Impuesto Base (1.5% Avalúo):</span>
                    <span className="font-mono font-bold text-slate-100">${liq.valorBaseImpuesto.toLocaleString()} COP</span>
                  </div>

                  {liq.descuentoProntoPago > 0 && (
                    <div className="flex justify-between py-1.5 text-emerald-400 font-bold">
                      <span>Descuento Pronto Pago (10%):</span>
                      <span className="font-mono">-${liq.descuentoProntoPago.toLocaleString()} COP</span>
                    </div>
                  )}

                  {liq.sancionMora > 0 && (
                    <div className="flex justify-between py-1.5 text-rose-400 font-bold">
                      <span>Sanción Extemporaneidad (Art. 641 ET):</span>
                      <span className="font-mono">+${liq.sancionMora.toLocaleString()} COP</span>
                    </div>
                  )}

                  {liq.interesesMora > 0 && (
                    <div className="flex justify-between py-1.5 text-rose-400 font-bold">
                      <span>Intereses Moratorios Diarios:</span>
                      <span className="font-mono">+${liq.interesesMora.toLocaleString()} COP</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 text-sm font-extrabold">
                    <span className="text-white">Total a Liquidar / Pagar:</span>
                    <span className="font-mono text-cyan-300 text-lg">${liq.valorTotalPagar.toLocaleString()} COP</span>
                  </div>
                </div>

                {liq.estado !== 'PAGADO' ? (
                  <button
                    onClick={() => {
                      setImpuestoSeleccionado(liq);
                      setPseModalOpen(true);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 hover:opacity-90 transition"
                  >
                    <CreditCard size={18} /> Pagar con Pasarela PSE en Línea
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Pagado el {liq.fechaPago}
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">Ref: {liq.reciboPagoRef}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Pasarela PSE */}
      {pseModalOpen && impuestoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="text-cyan-400" size={20} />
                Pasarela de Pagos PSE (Pagos Seguros en Línea)
              </h2>
              <button onClick={() => setPseModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handlePagarPSE} className="space-y-4 text-sm">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-400">Total a Debitar de tu Cuenta:</div>
                <div className="text-2xl font-extrabold font-mono text-cyan-300">${impuestoSeleccionado.valorTotalPagar.toLocaleString()} COP</div>
                <div className="text-[11px] text-slate-400">Placa: <strong className="text-amber-400">{impuestoSeleccionado.placaVehiculo}</strong> • Vigencia: <strong>{impuestoSeleccionado.vigenciaFiscal}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selecciona tu Banco PSE *</label>
                <select
                  value={bancoCodigo}
                  onChange={(e) => setBancoCodigo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
                >
                  <option value="BANCOLOMBIA_PSE">Bancolombia</option>
                  <option value="DAVIVIENDA_PSE">Banco Davivienda</option>
                  <option value="BANCO_BOGOTA_PSE">Banco de Bogotá</option>
                  <option value="NEQUI_PSE">Nequi</option>
                  <option value="DAVIPLATA_PSE">Daviplata</option>
                  <option value="BBVA_PSE">BBVA Colombia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo del Titular de la Cuenta *</label>
                <input
                  type="email"
                  required
                  value={emailPagador}
                  onChange={(e) => setEmailPagador(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setPseModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={pagando} className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50">
                  {pagando ? 'Procesando en PSE...' : 'Confirmar Pago en Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
