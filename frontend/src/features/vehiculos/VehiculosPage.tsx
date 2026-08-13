import React, { useState, useEffect } from 'react';
import { Car, Search, PlusCircle, RefreshCw, X, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';

export const VehiculosPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [traspasoModalOpen, setTraspasoModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [ciudadanosList, setCiudadanosList] = useState<any[]>([]);
  const [selectedPlacaTraspaso, setSelectedPlacaTraspaso] = useState('');
  const [nuevoPropietarioId, setNuevoPropietarioId] = useState('');

  const [formData, setFormData] = useState({
    placa: '',
    marca: 'Chevrolet',
    linea: 'Onix',
    modelo: 2024,
    cilindraje: 1400,
    color: 'Gris Plata',
    tipoVehiculo: 'AUTOMOVIL',
    claseServicio: 'PARTICULAR',
    numeroMotor: 'MOT987123',
    numeroChasis: 'CHA543210',
    fechaMatricula: '2024-01-15',
    propietarioInicialCiudadanoId: '',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resVeh, resCiud] = await Promise.all([
        fetch('/api/v1/vehiculos'),
        fetch('/api/v1/ciudadanos'),
      ]);

      const dataVeh = await resVeh.json();
      const dataCiud = await resCiud.json();

      if (resVeh.ok) setVehiculos(dataVeh.data || []);
      if (resCiud.ok) setCiudadanosList(dataCiud.data || []);
    } catch (err) {
      toast.error('Error al conectar con la base de datos de vehículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleMatricular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.propietarioInicialCiudadanoId) {
      toast.error('La placa y el propietario inicial son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al matricular vehículo');

      toast.success(`Vehículo con placa ${data.placa} matriculado exitosamente`);
      setModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error en matrícula');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTraspaso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacaTraspaso || !nuevoPropietarioId) {
      toast.error('Selecciona la placa y el nuevo propietario');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/vehiculos/${selectedPlacaTraspaso}/transferir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoPropietarioCiudadanoId: nuevoPropietarioId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al realizar traspaso');

      toast.success(`Traspaso de vehículo ${selectedPlacaTraspaso} realizado con éxito`);
      setTraspasoModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'No se pudo realizar el traspaso');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Car className="text-blue-400" size={26} />
            Registro y Estado de Vehículos
          </h1>
          <p className="text-sm text-slate-400">
            Control de matrículas, historial de propietarios y paz y salvo de comparendos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarDatos}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {user?.rol !== 'CIUDADANO' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:opacity-90 transition"
            >
              <PlusCircle size={18} />
              Matricular Vehículo
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa o marca..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Registros en sistema: <strong className="text-blue-400">{vehiculos.length}</strong>
        </span>
      </div>

      {/* Vehiculos Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Placa</th>
              <th className="py-3.5 px-4">Marca y Línea</th>
              <th className="py-3.5 px-4">Servicio / Tipo</th>
              <th className="py-3.5 px-4">Motor / Chasis</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((v) => (
                <tr key={v.placa} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-lg">
                      {v.placa}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{v.marca} {v.linea}</div>
                    <div className="text-xs text-slate-400">Modelo: {v.modelo} • {v.cilindraje} cc</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="text-slate-200 font-semibold">{v.claseServicio}</div>
                    <div className="text-slate-400">{v.tipoVehiculo}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                    <div>Motor: {v.numeroMotor}</div>
                    <div>Chasis: {v.numeroChasis}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {v.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedPlacaTraspaso(v.placa);
                        setTraspasoModalOpen(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 ml-auto"
                    >
                      <ArrowLeftRight size={14} /> Traspaso
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  {loading ? 'Cargando vehículos...' : 'No hay vehículos matriculados en el sistema.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Matricular Vehiculo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="text-blue-400" size={22} />
                Matricular Nuevo Vehículo
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleMatricular} className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                    placeholder="KIG982"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Línea *</label>
                  <input
                    type="text"
                    required
                    value={formData.linea}
                    onChange={(e) => setFormData({ ...formData, linea: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo (Año) *</label>
                  <input
                    type="number"
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cilindraje (cc) *</label>
                  <input
                    type="number"
                    required
                    value={formData.cilindraje}
                    onChange={(e) => setFormData({ ...formData, cilindraje: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Color *</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo Vehículo *</label>
                  <select
                    value={formData.tipoVehiculo}
                    onChange={(e) => setFormData({ ...formData, tipoVehiculo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="AUTOMOVIL">AUTOMOVIL</option>
                    <option value="MOTOCICLETA">MOTOCICLETA</option>
                    <option value="CAMION">CAMION</option>
                    <option value="BUS">BUS</option>
                    <option value="BUSETA">BUSETA</option>
                    <option value="TRACTOCAMION">TRACTOCAMION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Clase Servicio *</label>
                  <select
                    value={formData.claseServicio}
                    onChange={(e) => setFormData({ ...formData, claseServicio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="PARTICULAR">PARTICULAR</option>
                    <option value="PUBLICO">PUBLICO</option>
                    <option value="DIPLOMATICO">DIPLOMATICO</option>
                    <option value="OFICIAL">OFICIAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Número Motor *</label>
                  <input
                    type="text"
                    required
                    value={formData.numeroMotor}
                    onChange={(e) => setFormData({ ...formData, numeroMotor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Número Chasis *</label>
                  <input
                    type="text"
                    required
                    value={formData.numeroChasis}
                    onChange={(e) => setFormData({ ...formData, numeroChasis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Propietario Inicial (Ciudadano) *</label>
                <select
                  required
                  value={formData.propietarioInicialCiudadanoId}
                  onChange={(e) => setFormData({ ...formData, propietarioInicialCiudadanoId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="">-- Seleccionar Ciudadano --</option>
                  {ciudadanosList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tipoDocumento} {c.numeroDocumento} - {c.nombreCompleto || `${c.nombres} ${c.apellidos}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Matricular Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Traspaso de Propiedad */}
      {traspasoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="text-amber-400" size={20} />
                Traspaso de Vehículo ({selectedPlacaTraspaso})
              </h2>
              <button onClick={() => setTraspasoModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleTraspaso} className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                  <AlertCircle size={14} /> Validación de Paz y Salvo (Art. 52 Ley 769)
                </div>
                El sistema verificará automáticamente que el vehículo no tenga comparendos pendientes de pago antes de autorizar el traspaso.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nuevo Propietario (Ciudadano) *</label>
                <select
                  required
                  value={nuevoPropietarioId}
                  onChange={(e) => setNuevoPropietarioId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="">-- Seleccionar Nuevo Propietario --</option>
                  {ciudadanosList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tipoDocumento} {c.numeroDocumento} - {c.nombreCompleto || `${c.nombres} ${c.apellidos}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setTraspasoModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-50">
                  {submitting ? 'Procesando...' : 'Confirmar Traspaso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
