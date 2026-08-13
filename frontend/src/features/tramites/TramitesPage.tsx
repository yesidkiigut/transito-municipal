import React, { useState, useEffect } from 'react';
import { FileCheck, Search, PlusCircle, Clock, ChevronRight, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export const TramitesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTramite, setSelectedTramite] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [avanzarModalOpen, setAvanzarModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tramites, setTramites] = useState<any[]>([]);
  const [ciudadanosList, setCiudadanosList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tipoTramiteId: 'MATRICULA_INICIAL',
    ciudadanoSolicitanteId: '',
    observaciones: 'Solicitud inicial presentada en ventanilla.',
  });

  const [avanzarData, setAvanzarData] = useState({
    nuevoEstado: 'EN_REVISION',
    funcionarioId: 'usr-func-002',
    observacion: 'Documentos revisados y validados correctamente.',
    pasoNombre: 'Auditoría Técnica de Documentación',
  });

  const cargarDatos = async () => {
    try {
      const [resTrm, resCiud] = await Promise.all([
        fetch('/api/v1/tramites'),
        fetch('/api/v1/ciudadanos'),
      ]);

      const dataTrm = await resTrm.json();
      const dataCiud = await resCiud.json();

      if (resTrm.ok) setTramites(dataTrm.data || []);
      if (resCiud.ok) setCiudadanosList(dataCiud.data || []);
    } catch (err) {
      toast.error('Error al conectar con la base de datos');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleRadicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ciudadanoSolicitanteId) {
      toast.error('Selecciona el ciudadano solicitante');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/tramites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al radicar trámite');

      toast.success(`Trámite ${data.codigoTramite} radicado exitosamente`);
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error en radicación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvanzar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTramite) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/tramites/${selectedTramite.codigoTramite}/avanzar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avanzarData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al avanzar trámite');

      toast.success(`Trámite ${selectedTramite.codigoTramite} actualizado a ${data.estado}`);
      setSelectedTramite(data);
      setAvanzarModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Transición de estado no permitida');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tramites.filter(t =>
    t.codigoTramite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ciudadanoSolicitanteId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="text-amber-400" size={26} />
            Motor de Workflow de Trámites
          </h1>
          <p className="text-sm text-slate-400">
            Radicación, trazabilidad de estados y auditoría inmutable de historial.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:opacity-90 transition"
        >
          <PlusCircle size={18} />
          Radicar Nuevo Trámite
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Solicitante ID</th>
                <th className="py-3.5 px-4">Trámite</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Ver Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id || t.codigoTramite} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-amber-400">{t.codigoTramite}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{t.ciudadanoSolicitanteId}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{t.tipoTramiteId}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        t.estado === 'RADICADO' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        t.estado === 'EN_REVISION' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                        'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTramite(t)}
                        className="p-1.5 rounded-lg bg-slate-950 text-amber-400 hover:bg-slate-800 border border-slate-800"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No hay trámites radicados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Timeline Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="text-amber-400" size={20} />
            Trazabilidad del Workflow
          </h2>

          {selectedTramite ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 font-mono">Código Trámite:</div>
                <div className="text-base font-bold text-amber-400">{selectedTramite.codigoTramite}</div>
                <div className="text-xs text-slate-300 mt-1">Estado Actual: <strong className="text-white">{selectedTramite.estado}</strong></div>
              </div>

              <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
                {selectedTramite.historial && selectedTramite.historial.map((step: any, idx: number) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900"></div>
                    <div className="text-xs font-semibold text-slate-200">{step.paso}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Funcionario: {step.funcionarioId}</div>
                    <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{step.fecha}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => setAvanzarModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  Avanzar Paso en Workflow Engine
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Selecciona un trámite de la lista para inspeccionar su historial.
            </div>
          )}
        </div>
      </div>

      {/* Modal Radicar Tramite */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="text-amber-400" size={20} />
                Radicar Trámite de Tránsito
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleRadicar} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Trámite *</label>
                <select
                  value={formData.tipoTramiteId}
                  onChange={(e) => setFormData({ ...formData, tipoTramiteId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="MATRICULA_INICIAL">MATRICULA_INICIAL</option>
                  <option value="TRASLADO_CUENTA">TRASLADO_CUENTA</option>
                  <option value="DUPLICADO_PLACA">DUPLICADO_PLACA</option>
                  <option value="REEXPEDICION_LICENCIA">REEXPEDICION_LICENCIA</option>
                  <option value="RECATEGORIZACION_LICENCIA">RECATEGORIZACION_LICENCIA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudadano Solicitante *</label>
                <select
                  required
                  value={formData.ciudadanoSolicitanteId}
                  onChange={(e) => setFormData({ ...formData, ciudadanoSolicitanteId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="">-- Seleccionar Ciudadano --</option>
                  {ciudadanosList.map((c) => (
                    <option key={c.id} value={c.id}>{c.tipoDocumento} {c.numeroDocumento} - {c.nombreCompleto || c.nombres}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Radicando...' : 'Radicar Trámite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Avanzar Workflow */}
      {avanzarModalOpen && selectedTramite && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="text-amber-400" size={20} />
                Avanzar Trámite ({selectedTramite.codigoTramite})
              </h2>
              <button onClick={() => setAvanzarModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleAvanzar} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nuevo Estado *</label>
                <select
                  value={avanzarData.nuevoEstado}
                  onChange={(e) => setAvanzarData({ ...avanzarData, nuevoEstado: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="EN_REVISION">EN_REVISION</option>
                  <option value="EN_ESPERA_DOC">EN_ESPERA_DOC</option>
                  <option value="APROBADO">APROBADO</option>
                  <option value="RECHAZADO">RECHAZADO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observación del Auditor *</label>
                <textarea
                  required
                  rows={3}
                  value={avanzarData.observacion}
                  onChange={(e) => setAvanzarData({ ...avanzarData, observacion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setAvanzarModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Actualizando...' : 'Confirmar Transición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
