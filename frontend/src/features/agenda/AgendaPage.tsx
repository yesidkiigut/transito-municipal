import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, PlusCircle, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export const AgendaPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [citas, setCitas] = useState<any[]>([]);
  const [ciudadanosList, setCiudadanosList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ciudadanoId: '',
    tipoTramiteId: 'MATRICULA_INICIAL',
    puestoAtencionId: 'pst-modulo-01',
    fechaCita: '2026-08-13',
    horaInicio: '09:00',
    horaFin: '09:30',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resCit, resCiud] = await Promise.all([
        fetch('/api/v1/agenda'),
        fetch('/api/v1/ciudadanos'),
      ]);

      const dataCit = await resCit.json();
      const dataCiud = await resCiud.json();

      if (resCit.ok) setCitas(dataCit.data || []);
      if (resCiud.ok) setCiudadanosList(dataCiud.data || []);
    } catch (err) {
      toast.error('Error al conectar con la agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ciudadanoId) {
      toast.error('Selecciona el ciudadano solicitante');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reservar cita');

      toast.success(`Cita ${data.codigoCita} agendada exitosamente`);
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al agendar cita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAtender = async (codigoCita: string) => {
    try {
      const res = await fetch(`/api/v1/agenda/${codigoCita}/atender`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al atender cita');

      toast.success(`Cita ${codigoCita} marcada como ATENDIDA`);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cita');
    }
  };

  const handleCancelar = async (codigoCita: string) => {
    try {
      const res = await fetch(`/api/v1/agenda/${codigoCita}/cancelar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar cita');

      toast.success(`Cita ${codigoCita} CANCELADA`);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Restricción de cancelación < 4h');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="text-cyan-400" size={26} />
            Agenda Institucional y Citas
          </h1>
          <p className="text-sm text-slate-400">
            Control de disponibilidad, asignación de puestos de atención y restricción de cancelación (&lt;4h).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargarDatos} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 hover:opacity-90 transition"
          >
            <PlusCircle size={18} />
            Reservar Cita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {citas.length > 0 ? (
          citas.map((c) => (
            <div key={c.id || c.codigoCita} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400 font-bold">{c.codigoCita}</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  c.estado === 'ATENDIDA' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  c.estado === 'CANCELADA' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                  'bg-blue-950 text-blue-300 border-blue-800'
                }`}>
                  {c.estado}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-mono text-slate-300">Ciudadano ID: {c.ciudadanoId}</h3>
                <p className="text-sm font-bold text-white mt-0.5">{c.tipoTramiteId}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex justify-between items-center text-slate-300">
                <div className="flex items-center gap-1.5 font-mono text-cyan-300">
                  <Clock size={14} /> {c.fechaCita} {c.horaInicio} - {c.horaFin}
                </div>
                <span className="font-semibold text-slate-400">{c.puestoAtencionId}</span>
              </div>

              {c.estado === 'RESERVADA' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAtender(c.codigoCita)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/50 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Atender
                  </button>
                  <button
                    onClick={() => handleCancelar(c.codigoCita)}
                    className="px-3 py-2 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-rose-400 text-xs"
                    title="Cancelar Cita"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 space-y-2">
            <Calendar size={36} className="mx-auto text-cyan-400/60" />
            <div className="font-semibold text-slate-300">No hay citas reservadas en la agenda</div>
            <p className="text-xs text-slate-500">Usa el botón superior para agendar un nuevo turno.</p>
          </div>
        )}
      </div>

      {/* Modal Reservar Cita */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="text-cyan-400" size={20} />
                Reservar Cita Institucional
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleReservar} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudadano Solicitante *</label>
                <select
                  required
                  value={formData.ciudadanoId}
                  onChange={(e) => setFormData({ ...formData, ciudadanoId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="">-- Seleccionar Ciudadano --</option>
                  {ciudadanosList.map((c) => (
                    <option key={c.id} value={c.id}>{c.tipoDocumento} {c.numeroDocumento} - {c.nombreCompleto || c.nombres}</option>
                  ))}
                </select>
              </div>

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
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Cita *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaCita}
                    onChange={(e) => setFormData({ ...formData, fechaCita: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto de Atención *</label>
                  <select
                    value={formData.puestoAtencionId}
                    onChange={(e) => setFormData({ ...formData, puestoAtencionId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="pst-modulo-01">Módulo 1 - Trámites</option>
                    <option value="pst-modulo-02">Módulo 2 - Licencias</option>
                    <option value="pst-modulo-03">Módulo 3 - Traspasos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hora Inicio *</label>
                  <input
                    type="text"
                    required
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    placeholder="09:00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hora Fin *</label>
                  <input
                    type="text"
                    required
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    placeholder="09:30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Reservando...' : 'Reservar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
