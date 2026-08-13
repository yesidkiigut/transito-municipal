import React, { useState, useEffect } from 'react';
import { CreditCard, PlusCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const LicenciasPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [licencias, setLicencias] = useState<any[]>([]);
  const [ciudadanosList, setCiudadanosList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ciudadanoId: '',
    categoria: 'B1',
    restriccionesText: 'Uso de lentes',
    organismoExpedidor: 'Tránsito Municipal',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resCiud] = await Promise.all([
        fetch('/api/v1/ciudadanos'),
      ]);
      const dataCiud = await resCiud.json();
      if (resCiud.ok) setCiudadanosList(dataCiud.data || []);
    } catch (err) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleExpedir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ciudadanoId) {
      toast.error('Selecciona el ciudadano para expedir la licencia');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ciudadanoId: formData.ciudadanoId,
        categoria: formData.categoria,
        restricciones: formData.restriccionesText ? [formData.restriccionesText] : [],
        organismoExpedidor: formData.organismoExpedidor,
      };

      const res = await fetch('/api/v1/licencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al expedir licencia');

      toast.success(`Licencia ${data.numeroLicencia} (Categoría ${data.categoria}) expedida exitosamente`);
      setModalOpen(false);
      setLicencias([data, ...licencias]);
    } catch (err: any) {
      toast.error(err.message || 'Error en expedición de licencia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenovar = async (numeroLicencia: string) => {
    try {
      const res = await fetch(`/api/v1/licencias/${numeroLicencia}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al renovar');

      toast.success(`Licencia ${numeroLicencia} renovada hasta ${data.fechaVencimiento}`);
    } catch (err: any) {
      toast.error(err.message || 'No se pudo renovar la licencia');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="text-purple-400" size={26} />
            Gestión de Licencias de Conducción
          </h1>
          <p className="text-sm text-slate-400">
            Expedición según edad (<strong>Ley 2161 de 2021</strong>), recategorización y score de puntos.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:opacity-90 transition"
        >
          <PlusCircle size={18} />
          Expedir Nueva Licencia
        </button>
      </div>

      {/* Tarjetas de licencias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {licencias.length > 0 ? (
          licencias.map((lic) => (
            <div
              key={lic.numeroLicencia || lic.id}
              className={`p-6 rounded-3xl border bg-slate-900/90 shadow-2xl relative overflow-hidden backdrop-blur-md ${
                lic.estado === 'SUSPENDIDA' ? 'border-rose-500/40' : 'border-purple-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono text-purple-400 font-bold">{lic.numeroLicencia}</span>
                  <h3 className="text-sm font-bold text-white mt-1">Titular ID: {lic.ciudadanoId}</h3>
                </div>
                <span className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800 text-purple-300 font-extrabold flex items-center justify-center text-base shadow-lg">
                  {lic.categoria}
                </span>
              </div>

              <div className="space-y-3 py-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Puntos de Score:</span>
                  <span className={`font-mono font-bold ${lic.puntosAcumulados > 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {lic.puntosAcumulados} / 12 Puntos
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      lic.puntosAcumulados > 5 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{ width: `${(lic.puntosAcumulados / 12) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Vencimiento:</span>
                  <span className="text-slate-200 font-mono">{lic.fechaVencimiento}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  lic.estado === 'VIGENTE' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {lic.estado}
                </span>
                <button
                  onClick={() => handleRenovar(lic.numeroLicencia)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Renovar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 space-y-2">
            <CreditCard size={36} className="mx-auto text-purple-400/60" />
            <div className="font-semibold text-slate-300">No hay licencias expedidas recientemente</div>
            <p className="text-xs text-slate-500">Usa el botón superior para expedir una nueva licencia de conducción.</p>
          </div>
        )}
      </div>

      {/* Modal Expedir Licencia */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="text-purple-400" size={22} />
                Expedir Licencia de Conducción
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleExpedir} className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-purple-300 flex items-center gap-1">
                  <AlertCircle size={14} /> Reglas Ley 2161 de 2021 & Art. 19 Ley 769
                </div>
                <p>• Particulares (A1, A2, B1, B2, B3): Mínimo 16 años (Vigencia 10 años &lt;60).</p>
                <p>• Servicio Público (C1, C2, C3): Mínimo 18 años (Vigencia 3 años &lt;60).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudadano Solicintante *</label>
                <select
                  required
                  value={formData.ciudadanoId}
                  onChange={(e) => setFormData({ ...formData, ciudadanoId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="">-- Seleccionar Ciudadano --</option>
                  {ciudadanosList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tipoDocumento} {c.numeroDocumento} - {c.nombreCompleto || `${c.nombres} ${c.apellidos}`} (Edad: {c.edad || 25} años)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría *</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="A1">A1 (Motos hasta 125cc)</option>
                    <option value="A2">A2 (Motos más de 125cc)</option>
                    <option value="B1">B1 (Autos Particulares)</option>
                    <option value="B2">B2 (Camiones Particulares)</option>
                    <option value="C1">C1 (Autos Servicio Público)</option>
                    <option value="C2">C2 (Buses Servicio Público)</option>
                    <option value="C3">C3 (Articulados Público)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Restricciones</label>
                  <input
                    type="text"
                    value={formData.restriccionesText}
                    onChange={(e) => setFormData({ ...formData, restriccionesText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    placeholder="Ej. Uso de lentes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Expidiendo...' : 'Expedir Licencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
