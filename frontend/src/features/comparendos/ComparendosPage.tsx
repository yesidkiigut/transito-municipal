import React, { useState, useEffect } from 'react';
import { ShieldAlert, PlusCircle, RefreshCw, X, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';

export const ComparendosPage: React.FC = () => {
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [resolucionModalOpen, setResolucionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [comparendos, setComparendos] = useState<any[]>([]);
  const [ciudadanosList, setCiudadanosList] = useState<any[]>([]);
  const [vehiculosList, setVehiculosList] = useState<any[]>([]);
  const [selectedComparendo, setSelectedComparendo] = useState('');

  const [formData, setFormData] = useState({
    placaVehiculo: '',
    ciudadanoId: '',
    tipoInfraccionId: 'C29',
    lugarInfraccion: 'Av. El Poblado #45-10',
    agenteTransitoId: 'AGT-007',
    gradoInfraccion: 2,
    valorMulta: 650000,
    observaciones: 'Exceso de velocidad capturado por radar.',
  });

  const [resolucionData, setResolucionData] = useState({
    tipo: 'FALLA' as 'FALLA' | 'CONDENA' | 'ARCHIVO',
    motivo: 'Fallo sancionatorio emitido tras vencimiento del término de descargos.',
    funcionarioId: 'usr-func-002',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resCmp, resCiud, resVeh] = await Promise.all([
        fetch('/api/v1/comparendos'),
        fetch('/api/v1/ciudadanos'),
        fetch('/api/v1/vehiculos'),
      ]);

      const dataCmp = await resCmp.json();
      const dataCiud = await resCiud.json();
      const dataVeh = await resVeh.json();

      if (resCmp.ok) setComparendos(dataCmp.data || []);
      if (resCiud.ok) setCiudadanosList(dataCiud.data || []);
      if (resVeh.ok) setVehiculosList(dataVeh.data || []);
    } catch (err) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleImponer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placaVehiculo || !formData.ciudadanoId) {
      toast.error('La placa del vehículo y el ciudadano infractor son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/comparendos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al imponer comparendo');

      toast.success(`Comparendo ${data.numeroComparendo} impuesto exitosamente`);
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error en imposición');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComparendo || !resolucionData.motivo) {
      toast.error('Completa los campos obligatorios para la resolución');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/comparendos/${selectedComparendo}/resolucion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolucionData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al resolucionar comparendo');

      toast.success(`Resolución para comparendo ${selectedComparendo} registrada`);
      setResolucionModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al emitir resolución');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-400" size={26} />
            Comparendos e Infracciones
          </h1>
          <p className="text-sm text-slate-400">
            Imposición de comparendos, prontopago (**Art. 136 Ley 769**) y resoluciones sancionatorias.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargarDatos} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {user?.rol !== 'CIUDADANO' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-semibold shadow-lg shadow-rose-500/20 flex items-center gap-2 hover:opacity-90 transition"
            >
              <PlusCircle size={18} />
              Imponer Comparendo
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Número</th>
              <th className="py-3.5 px-4">Placa</th>
              <th className="py-3.5 px-4">Infractor ID</th>
              <th className="py-3.5 px-4">Infracción / Valor</th>
              <th className="py-3.5 px-4">Deducción Puntos</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4 text-right">Resolución</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {comparendos.length > 0 ? (
              comparendos.map((c) => (
                <tr key={c.id || c.numeroComparendo} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-medium text-rose-400">{c.numeroComparendo}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                      {c.placaVehiculo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-200">{c.ciudadanoId}</td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="text-slate-200">{c.tipoInfraccionId}</div>
                    <div className="text-rose-400 font-bold font-mono">${c.valorMulta?.toLocaleString()} COP</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">
                    -{c.puntosDescuento} Pts (Grado {c.gradoInfraccion})
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      c.estado === 'PAGADO_EXTERNO' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      c.estado === 'NOTIFICADO' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedComparendo(c.numeroComparendo);
                        setResolucionModalOpen(true);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2.5 py-1 rounded bg-slate-950 border border-slate-800"
                    >
                      Emitir Fallo
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  {loading ? 'Cargando comparendos...' : 'No hay comparendos registrados en el sistema.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Imponer Comparendo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="text-rose-400" size={22} />
                Imponer Comparendo de Tránsito
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleImponer} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Placa Vehículo *</label>
                  <select
                    required
                    value={formData.placaVehiculo}
                    onChange={(e) => setFormData({ ...formData, placaVehiculo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="">-- Seleccionar Placa --</option>
                    {vehiculosList.map((v) => (
                      <option key={v.placa} value={v.placa}>{v.placa} ({v.marca} {v.linea})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudadano Infractor *</label>
                  <select
                    required
                    value={formData.ciudadanoId}
                    onChange={(e) => setFormData({ ...formData, ciudadanoId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="">-- Seleccionar Infractor --</option>
                    {ciudadanosList.map((c) => (
                      <option key={c.id} value={c.id}>{c.tipoDocumento} {c.numeroDocumento} - {c.nombreCompleto || c.nombres}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código Infracción *</label>
                  <input
                    type="text"
                    required
                    value={formData.tipoInfraccionId}
                    onChange={(e) => setFormData({ ...formData, tipoInfraccionId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    placeholder="C29"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Grado (1 - 4) *</label>
                  <select
                    value={formData.gradoInfraccion}
                    onChange={(e) => setFormData({ ...formData, gradoInfraccion: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value={1}>Grado 1 (-1 pto)</option>
                    <option value={2}>Grado 2 (-3 ptos)</option>
                    <option value={3}>Grado 3 (-5 ptos)</option>
                    <option value={4}>Grado 4 (-10 ptos / Alcoholemia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Multa ($ COP) *</label>
                  <input
                    type="number"
                    required
                    value={formData.valorMulta}
                    onChange={(e) => setFormData({ ...formData, valorMulta: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lugar de Infracción *</label>
                <input
                  type="text"
                  required
                  value={formData.lugarInfraccion}
                  onChange={(e) => setFormData({ ...formData, lugarInfraccion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Imponer Comparendo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Emitir Resolución */}
      {resolucionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="text-rose-400" size={20} />
                Emitir Resolución ({selectedComparendo})
              </h2>
              <button onClick={() => setResolucionModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleResolucion} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Resolución *</label>
                <select
                  value={resolucionData.tipo}
                  onChange={(e) => setResolucionData({ ...resolucionData, tipo: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="FALLA">FALLA (Declarar Contravención)</option>
                  <option value="CONDENA">CONDENA (Sanción Firme)</option>
                  <option value="ARCHIVO">ARCHIVO (Causales Eximentes / Exonerado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo / Fundamento Legal *</label>
                <textarea
                  required
                  rows={3}
                  value={resolucionData.motivo}
                  onChange={(e) => setResolucionData({ ...resolucionData, motivo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setResolucionModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Emitir Resolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
