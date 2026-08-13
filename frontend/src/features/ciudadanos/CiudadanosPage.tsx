import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Filter, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export const CiudadanosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ciudadanos, setCiudadanos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '1995-05-15',
    correo: '',
    telefono: '',
    via: 'Calle 10',
    numero1: '45',
    numero2: '20',
    barrio: 'El Poblado',
    ciudad: 'Medellín',
    departamento: 'Antioquia',
  });

  const cargarCiudadanos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ciudadanos');
      const data = await res.json();
      if (res.ok) {
        setCiudadanos(data.data || []);
      } else {
        toast.error(data.error || 'Error al cargar ciudadanos');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCiudadanos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numeroDocumento || !formData.nombres || !formData.apellidos || !formData.correo) {
      toast.error('Por favor completa todos los campos requeridos (*)');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fechaNacimiento: formData.fechaNacimiento,
        correo: formData.correo,
        telefono: formData.telefono || '3000000000',
        direccion: {
          via: formData.via,
          numero1: formData.numero1,
          numero2: formData.numero2,
          barrio: formData.barrio,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
        },
      };

      const res = await fetch('/api/v1/ciudadanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar ciudadano');
      }

      toast.success(`Ciudadano ${data.nombres} ${data.apellidos} registrado exitosamente`);
      setModalOpen(false);
      cargarCiudadanos();

      setFormData({
        tipoDocumento: 'CC',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '1995-05-15',
        correo: '',
        telefono: '',
        via: 'Calle 10',
        numero1: '45',
        numero2: '20',
        barrio: 'El Poblado',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
      });
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar ciudadano');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = ciudadanos.filter(c =>
    c.numeroDocumento.includes(searchTerm) ||
    (c.nombreCompleto && c.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.nombres && c.nombres.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="text-cyan-400" size={26} />
            Gestión de Ciudadanos
          </h1>
          <p className="text-sm text-slate-400">
            Registro, consulta y administración de personas (Conductores y Propietarios).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarCiudadanos}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Recargar datos"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 hover:opacity-90 transition"
          >
            <UserPlus size={18} />
            Registrar Ciudadano
          </button>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por documento o nombre..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter size={14} />
          <span>Total en base de datos: <strong className="text-cyan-400">{ciudadanos.length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Documento</th>
              <th className="py-3.5 px-4">Nombres y Apellidos</th>
              <th className="py-3.5 px-4">Contacto</th>
              <th className="py-3.5 px-4">Dirección</th>
              <th className="py-3.5 px-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    <span className="text-cyan-400 mr-1.5 font-bold">{c.tipoDocumento}</span>
                    {c.numeroDocumento}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">
                    {c.nombreCompleto || `${c.nombres} ${c.apellidos}`}
                  </td>
                  <td className="py-3.5 px-4 text-xs space-y-0.5">
                    <div className="text-slate-300">{c.correo}</div>
                    <div className="text-slate-500">{c.telefono}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">{c.direccion}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  {loading ? 'Cargando ciudadanos...' : 'No hay ciudadanos registrados en la base de datos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Registrar Ciudadano */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-cyan-400" />
                Registrar Nuevo Ciudadano
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo Doc *</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="CC">CC (Cédula)</option>
                    <option value="CE">CE (Extranjería)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Número Documento *</label>
                  <input
                    type="text"
                    required
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="1098765432"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="Carlos Eduardo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="Mendoza Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="3101234567"
                  />
                </div>
              </div>

              {/* Dirección Value Object */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Dirección Residencial</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Vía (Calle/Cra)</label>
                    <input
                      type="text"
                      required
                      value={formData.via}
                      onChange={(e) => setFormData({ ...formData, via: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Número 1</label>
                    <input
                      type="text"
                      value={formData.numero1}
                      onChange={(e) => setFormData({ ...formData, numero1: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Número 2</label>
                    <input
                      type="text"
                      value={formData.numero2}
                      onChange={(e) => setFormData({ ...formData, numero2: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Barrio</label>
                    <input
                      type="text"
                      value={formData.barrio}
                      onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Ciudad *</label>
                    <input
                      type="text"
                      required
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Departamento *</label>
                    <input
                      type="text"
                      required
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-600/30 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar en Base de Datos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
