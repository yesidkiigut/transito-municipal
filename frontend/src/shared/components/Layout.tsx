import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PasarelaConfigModal } from '@/features/admin/PasarelaConfigModal';
import {
  ShieldAlert,
  Users,
  Car,
  FileCheck,
  Calendar,
  BarChart3,
  LogOut,
  Building2,
  Menu,
  X,
  CreditCard,
  Bell,
  UserCheck,
  ChevronRight,
  Landmark,
  FileInput,
  Bus,
  Settings
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItemsByRole = (rol?: string) => {
    if (rol === 'CIUDADANO') {
      return [
        { label: 'Mi Carpeta Ciudadana', path: '/', icon: UserCheck },
        { label: 'Impuesto Vehicular & PSE', path: '/impuestos', icon: Landmark },
        { label: 'Preinscripción Digital', path: '/preinscripcion', icon: FileInput },
        { label: 'Mis Vehículos', path: '/vehiculos', icon: Car },
        { label: 'Mi Licencia', path: '/licencias', icon: CreditCard },
        { label: 'Mis Comparendos', path: '/comparendos', icon: ShieldAlert },
        { label: 'Mis Trámites', path: '/tramites', icon: FileCheck },
        { label: 'Reservar Citas', path: '/agenda', icon: Calendar },
      ];
    }
    if (rol === 'FUNCIONARIO') {
      return [
        { label: 'Panel Operativo', path: '/', icon: BarChart3 },
        { label: 'Impuestos & Liquidación', path: '/impuestos', icon: Landmark },
        { label: 'Rodamiento Municipal', path: '/rodamiento', icon: Bus },
        { label: 'Preinscripciones', path: '/preinscripcion', icon: FileInput },
        { label: 'Consultar Ciudadanos', path: '/ciudadanos', icon: Users },
        { label: 'Parque Automotor', path: '/vehiculos', icon: Car },
        { label: 'Licencias de Conducción', path: '/licencias', icon: CreditCard },
        { label: 'Imposición Comparendos', path: '/comparendos', icon: ShieldAlert },
        { label: 'Workflow de Trámites', path: '/tramites', icon: FileCheck },
        { label: 'Atención de Citas', path: '/agenda', icon: Calendar },
      ];
    }
    // ADMIN (Acceso total)
    return [
      { label: 'Dashboard General', path: '/', icon: BarChart3 },
      { label: 'Impuestos & PSE', path: '/impuestos', icon: Landmark },
      { label: 'Rodamiento Municipal', path: '/rodamiento', icon: Bus },
      { label: 'Preinscripción Digital', path: '/preinscripcion', icon: FileInput },
      { label: 'Gestión Ciudadanos', path: '/ciudadanos', icon: Users },
      { label: 'Gestión Vehículos', path: '/vehiculos', icon: Car },
      { label: 'Licencias Conducción', path: '/licencias', icon: CreditCard },
      { label: 'Comparendos e Infracciones', path: '/comparendos', icon: ShieldAlert },
      { label: 'Motor de Trámites', path: '/tramites', icon: FileCheck },
      { label: 'Agenda y Citas', path: '/agenda', icon: Calendar },
      { label: 'Reportes Globales', path: '/reportes', icon: BarChart3 },
    ];
  };

  const navItems = getNavItemsByRole(user?.rol);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  STransito
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm">
                  {user?.rol === 'CIUDADANO' ? 'Portal Ciudadano' : user?.rol === 'FUNCIONARIO' ? 'Panel Operativo' : 'Admin Municipal'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">Sistema Municipal de Tránsito Terrestre</p>
            </div>
          </div>
        </div>

        {/* User Badge & Admin Pasarela Button */}
        <div className="flex items-center gap-3">
          {user?.rol === 'ADMIN' && (
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Configurar Pasarela PSE"
            >
              <Settings size={15} /> Configurar PSE
            </button>
          )}

          <button className="p-2.5 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-pulse"></span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-100">{user.nombre}</span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  user.rol === 'ADMIN' ? 'text-cyan-400' :
                  user.rol === 'FUNCIONARIO' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {user.rol}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-extrabold shadow-md">
                {user.nombre.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-xl border border-rose-900/30 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/40 p-4 gap-1.5 backdrop-blur-md">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 px-3 py-1 mb-1">
            {user?.rol === 'CIUDADANO' ? 'Servicios Ciudadano' : 'Módulos de Control'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/50 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-cyan-400" />}
              </Link>
            );
          })}

          <div className="mt-auto pt-6 border-t border-slate-800/80 px-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1 shadow-lg">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Normativa Colombiana
              </div>
              <p className="text-[11px] text-slate-400">Ley 488 • Ley 769 • Ley 2161 • Pasarela PSE</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="font-extrabold text-lg text-white">Menú Principal</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-base font-semibold"
                >
                  <item.icon size={20} className="text-cyan-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Modal de Configuración Pasarela PSE */}
      <PasarelaConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />
    </div>
  );
};
