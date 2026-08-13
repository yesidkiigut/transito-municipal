import React, { useState, useEffect } from 'react';
import { Bus, PlusCircle, RefreshCw, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const RodamientoPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rodamientos, setRodamientos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    placaVehiculo: 'KIG982',
    vigenciaAnio: 2026,
    valorTasa: 185000,
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/rodamiento');
      const data = await res.json();
      if (res.ok) setRodamientos(data.data || []);
    } catch (err) {
      toast.error('Error al conectar con la tasa de rodamiento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEmitirRodamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placaVehiculo) {
      toast.error('La placa del vehículo es obligatoria');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/rodamiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al emitir rodamiento');

      toast.success(`Certificado de Rodamiento ${data.certificadoRef} expedido con éxito`);
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al expedir rodamiento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bus className="text-sky-400" size={26} />
            Impuesto y Tasa de Rodamiento Municipal
          </h1>
          <p className="text-sm text-slate-400">
            Control de derechos de rodamiento, tarjeta de operación y paz y salvo para transporte público urbano.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargarDatos} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 flex items-center gap-2 hover:opacity-90 transition"
          >
            <PlusCircle size={18} />
            Liquidación / Certificado Rodamiento
          </button>
        </div>
      </div>

      {/* Lista de Rodamientos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rodamientos.length > 0 ? (
          rodamientos.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                  {r.placaVehiculo}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} /> PAZ Y SALVO
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-mono">Certificado: {r.certificadoRef}</div>
                <div className="text-base font-extrabold text-white mt-0.5">Vigencia Fiscal: {r.vigenciaAnio}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center text-slate-300">
                <span>Tasa Municipal:</span>
                <span className="font-mono font-bold text-sky-300">${r.valorTasa?.toLocaleString()} COP</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 space-y-2">
            <Bus size={36} className="mx-auto text-sky-400/60" />
            <div className="font-semibold text-slate-300">No hay derechos de rodamiento liquidados recientemente</div>
            <p className="text-xs text-slate-500">Usa el botón superior para expedir la tasa de rodamiento municipal.</p>
          </div>
        )}
      </div>

      {/* Modal Emitir Rodamiento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bus className="text-sky-400" size={20} />
                Expedir Tasa de Rodamiento Municipal
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleEmitirRodamiento} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Placa Vehículo Público *</label>
                <input
                  type="text"
                  required
                  value={formData.placaVehiculo}
                  onChange={(e) => setFormData({ ...formData, placaVehiculo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-extrabold uppercase"
                  placeholder="KIG982"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vigencia Fiscal *</label>
                  <input
                    type="number"
                    required
                    value={formData.vigenciaAnio}
                    onChange={(e) => setFormData({ ...formData, vigenciaAnio: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Tasa ($ COP) *</label>
                  <input
                    type="number"
                    required
                    value={formData.valorTasa}
                    onChange={(e) => setFormData({ ...formData, valorTasa: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Expidiendo...' : 'Expedir Certificado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
