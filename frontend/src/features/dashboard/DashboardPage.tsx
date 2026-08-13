import React from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Car,
  CreditCard,
  ShieldAlert,
  FileCheck,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.rol === 'CIUDADANO') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header Ciudadano */}
        <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/40">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-3.5 py-1 rounded-full shadow-inner">
              <Sparkles size={14} className="text-cyan-400" /> Portal Mi Carpeta Ciudadana
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              ¡Bienvenido, <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">{user.nombre}</span>!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consulta en tiempo real el estado de tus vehículos, vigencia de tu licencia de conducción (**Ley 2161 de 2021**), comparendos pendientes y reservas de citas.
            </p>
          </div>
        </div>

        {/* Resumen personal de Ciudadano */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-cyan-500/50 transition duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Mis Vehículos</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                <Car size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">1 Registrado</div>
            <div className="text-xs text-slate-400">Placa: <strong className="text-amber-400 font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">KIG-982</strong></div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-purple-500/50 transition duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Mi Licencia</span>
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">12 / 12 Pts</div>
            <div className="text-xs text-slate-300">Categoría: <strong className="text-purple-300 font-bold">B1 (Vigente 10 años)</strong></div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-emerald-500/50 transition duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Mis Comparendos</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">0 Pendientes</div>
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={14} /> Paz y Salvo RUNT / SIMIT
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-amber-500/50 transition duration-300">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Mis Citas</span>
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                <Calendar size={20} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">0 Citas</div>
            <Link to="/agenda" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1">
              <PlusCircle size={14} /> Reservar nueva cita
            </Link>
          </div>
        </div>

        {/* Accesos Rápidos del Ciudadano */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/vehiculos" className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition duration-300">
              <Car size={24} />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">Mis Vehículos Matriculados</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Consulta especificaciones técnicas, motor, chasis y paz y salvo de comparendos.</p>
          </Link>

          <Link to="/licencias" className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition duration-300">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">Mi Licencia de Conducción</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Revisa el puntaje pedagógico, fecha de vencimiento y recategorización.</p>
          </Link>

          <Link to="/agenda" className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition duration-300">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">Reservar Cita en Ventanilla</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Agenda turnos de atención presencial para trámites o renovaciones.</p>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard de Administración / Funcionario Operativo
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner Superior */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-3.5 py-1 rounded-full">
            {user?.rol === 'ADMIN' ? 'Centro de Control Administrativo' : 'Panel Operativo de Agentes'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Sistema Municipal de Tránsito y Transporte
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Plataforma institucional para gestión de trámites, licencias con vigencia legal (**Ley 2161 de 2021**),comparendos CNSV y control de traspasos sin módulo de pagos.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-cyan-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Ciudadanos Registrados</span>
            <User size={20} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">1,248</div>
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp size={14} /> +12% este mes
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-blue-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Vehículos Matriculados</span>
            <Car size={20} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">856</div>
          <div className="text-xs text-slate-300 font-semibold">85% Particular • 15% Público</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-rose-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Comparendos Impuestos</span>
            <ShieldAlert size={20} className="text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">342</div>
          <div className="text-xs text-rose-300 font-semibold">18 pendientes de resolución</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Trámites en Workflow</span>
            <FileCheck size={20} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">45</div>
          <div className="text-xs text-amber-300 font-semibold">12 aprobados hoy</div>
        </div>
      </div>

      {/* Secciones y Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-lg font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Trámites Recientes en Workflow</span>
            <Link to="/tramites" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold">
              Ver todos <ArrowRight size={14} />
            </Link>
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono font-bold text-cyan-400">TRM-2026-001</span>
                <div className="font-bold text-slate-100 mt-0.5">Matrícula Inicial Chevrolet Onix</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                RADICADO
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono font-bold text-cyan-400">TRM-2026-002</span>
                <div className="font-bold text-slate-100 mt-0.5">Traspaso de Propiedad KIG982</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                EN REVISION
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-lg font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Alertas de Cumplimiento Legal</span>
            <AlertTriangle size={18} className="text-amber-400" />
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle size={14} /> Reincidencia CNT (Art. 124 Ley 769)
              </div>
              <p className="text-slate-300 leading-relaxed">El sistema monitorea infracciones repetidas en menos de 6 meses para suspensión automática de licencia.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/80 text-blue-200 space-y-1">
              <div className="font-bold text-blue-300">Ley 2161 de 2021</div>
              <p className="text-slate-300 leading-relaxed">Vigencias de licencias calculadas por rango de edad (&lt;60 años: 10 años, 60-80 años: 5 años, &gt;80 años: 1 año).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
