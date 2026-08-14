import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
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
  Settings,
  Palette,
  QrCode,
  Database,
  DollarSign,
  Sliders,
  Layers
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { config } = useThemeStore();
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
        { label: 'Estado de Cuenta & Mora', path: '/estado-cuenta', icon: Layers },
        { label: 'Acuerdos de Pago', path: '/acuerdos-pago', icon: Sliders },
        { label: 'Pagar PSE & Bre-B', path: '/pagos', icon: QrCode },
        { label: 'Impuesto Vehicular', path: '/impuestos', icon: Landmark },
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
        { label: 'Estado de Cuenta & Mora', path: '/estado-cuenta', icon: Layers },
        { label: 'Acuerdos de Financiación', path: '/acuerdos-pago', icon: Sliders },
        { label: 'Recaudo PSE / Bre-B', path: '/pagos', icon: QrCode },
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
      { label: 'Estado de Cuenta & Mora', path: '/estado-cuenta', icon: Layers },
      { label: 'Acuerdos de Financiación', path: '/acuerdos-pago', icon: Sliders },
      { label: 'Configuración Normativa & Tasas', path: '/configuracion-normativa', icon: Settings },
      { label: 'Recaudo PSE & Bre-B', path: '/pagos', icon: QrCode },
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
      { label: 'Tesorería & Auditoría', path: '/tesoreria', icon: DollarSign },
      { label: 'Conciliación HASSQL', path: '/hassql-sync', icon: Database },
      { label: 'Identidad Visual & Logos', path: '/branding', icon: Palette },
    ];
  };

  const navItems = getNavItemsByRole(user?.rol);

  return (
    <div
      style={{ backgroundColor: config.colorFondo || '#020617' }}
      className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300"
    >
      {/* Top Header Navbar */}
      <header
        style={{ backgroundColor: config.colorNavbar ? `${config.colorNavbar}fa` : '#0f172aee' }}
        className="h-16 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-2xl transition-colors duration-300"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-3 group">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt="Logo Institucional"
                className="w-10 h-10 object-contain drop-shadow group-hover:scale-105 transition"
              />
            ) : (
              <div
                style={{
                  background: `linear-gradient(to top right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'})`,
                }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20 group-hover:scale-105 transition duration-200"
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    background: `linear-gradient(to right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'}, ${config.colorAcento || '#4f46e5'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  className="font-extrabold text-xl tracking-tight"
                >
                  {config.nombreMunicipio || 'STransito'}
                </span>
                <span
                  style={{
                    backgroundColor: `${config.colorPrimario || '#06b6d4'}20`,
                    color: config.colorPrimario || '#38bdf8',
                    borderColor: `${config.colorPrimario || '#06b6d4'}60`,
                  }}
                  className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                >
                  {user?.rol === 'CIUDADANO' ? 'Portal Ciudadano' : user?.rol === 'FUNCIONARIO' ? 'Panel Operativo' : 'Admin Municipal'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                {config.nombreSecretaria || 'Sistema Municipal de Tránsito Terrestre'}
              </p>
            </div>
          </Link>
        </div>

        {/* User Badge & Admin Buttons */}
        <div className="flex items-center gap-3">
          {user?.rol === 'ADMIN' && (
            <>
              <Link
                to="/branding"
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold hidden sm:flex items-center gap-1.5 transition shadow-sm"
                title="Personalizar Identidad Visual, Logos y Colores"
              >
                <Palette size={15} /> Personalizar Visual
              </Link>
              <button
                onClick={() => setConfigModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hidden md:flex items-center gap-1.5 transition shadow-sm"
                title="Configurar Pasarela PSE"
              >
                <Settings size={15} /> PSE
              </button>
            </>
          )}

          <button className="p-2.5 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition relative">
            <Bell size={18} />
            <span
              style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 animate-pulse"
            ></span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-100">{user.nombre}</span>
                <span
                  style={{ color: config.colorPrimario || '#38bdf8' }}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider"
                >
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
        <aside
          style={{ backgroundColor: config.colorSidebar ? `${config.colorSidebar}e6` : '#0f172a66' }}
          className="hidden md:flex flex-col w-64 border-r border-slate-800/80 p-4 gap-1.5 backdrop-blur-md transition-colors duration-300"
        >
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
                style={{
                  backgroundColor: isActive ? `${config.colorPrimario || '#06b6d4'}20` : undefined,
                  color: isActive ? config.colorPrimario || '#38bdf8' : undefined,
                  borderColor: isActive ? `${config.colorPrimario || '#06b6d4'}50` : 'transparent',
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'shadow-lg shadow-cyan-950/50 font-bold border'
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
