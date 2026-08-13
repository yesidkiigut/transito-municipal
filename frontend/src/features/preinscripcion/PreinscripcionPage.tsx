import React, { useState, useEffect } from 'react';
import { FileInput, PlusCircle, RefreshCw, X, CheckCircle2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export const PreinscripcionPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [preinscripciones, setPreinscripciones] = useState<any[]>([]);
  const [ciudadanosList, setCiudadanosList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ciudadanoId: '',
    tipoTramiteCodigo: 'MATRICULA_INICIAL',
    placaVehiculo: 'KIG982',
    observaciones: 'Preinscripción digital para verificación de SOAT y Técnico-mecánica.',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resPre, resCiud] = await Promise.all([
        fetch('/api/v1/preinscripciones'),
        fetch('/api/v1/ciudadanos'),
      ]);

      const dataPre = await resPre.json();
      const dataCiud = await resCiud.json();

      if (resPre.ok) setPreinscripciones(dataPre.data || []);
      if (resCiud.ok) setCiudadanosList(dataCiud.data || []);
    } catch (err) {
      toast.error('Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handlePreinscribir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ciudadanoId) {
      toast.error('Selecciona el ciudadano para preinscribir');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/preinscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en preinscripción');

      toast.success(`Preinscripción ${data.codigoPreinscripcion} registrada exitosamente`);
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar preinscripción');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileInput className="text-emerald-400" size={26} />
            Preinscripción Digital de Trámites e Impuestos
          </h1>
          <p className="text-sm text-slate-400">
            Pre-carga de documentos, validación en línea de requisitos y generación de PIN de atención ágil.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargarDatos} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:opacity-90 transition"
          >
            <PlusCircle size={18} />
            Nueva Preinscripción
          </button>
        </div>
      </div>

      {/* Lista de Preinscripciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {preinscripciones.length > 0 ? (
          preinscripciones.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-emerald-400">{p.codigoPreinscripcion}</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {p.estado}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-mono">Solicitante ID: {p.ciudadanoId}</div>
                <div className="text-sm font-bold text-white mt-0.5">{p.tipoTramiteCodigo}</div>
              </div>

              {p.placaVehiculo && (
                <div className="text-xs text-slate-300 font-mono">
                  Placa Asociada: <strong className="text-amber-400">{p.placaVehiculo}</strong>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>PIN QR listo para ventanilla</span>
                <QrCode size={16} className="text-emerald-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 space-y-2">
            <FileInput size={36} className="mx-auto text-emerald-400/60" />
            <div className="font-semibold text-slate-300">No hay preinscripciones registradas</div>
            <p className="text-xs text-slate-500">Usa el botón superior para realizar una preinscripción digital.</p>
          </div>
        )}
      </div>

      {/* Modal Nueva Preinscripción */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileInput className="text-emerald-400" size={20} />
                Realizar Preinscripción Digital
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handlePreinscribir} className="space-y-4 text-sm">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trámite / Impuesto *</label>
                <select
                  value={formData.tipoTramiteCodigo}
                  onChange={(e) => setFormData({ ...formData, tipoTramiteCodigo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="IMPUESTO_VEHICULAR_PUBLICO">Impuesto Vehicular Servicio Público</option>
                  <option value="MATRICULA_INICIAL">Matrícula Inicial</option>
                  <option value="TRASPASO_PROPIEDAD">Traspaso de Propiedad</option>
                  <option value="RODAMIENTO_MUNICIPAL">Tasa de Rodamiento Municipal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Placa Vehículo (Opcional)</label>
                <input
                  type="text"
                  value={formData.placaVehiculo}
                  onChange={(e) => setFormData({ ...formData, placaVehiculo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono uppercase"
                  placeholder="KIG982"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Preinscribir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
