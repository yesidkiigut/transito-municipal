import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@transito.gov.co');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { config } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      login(data.user, data.accessToken);
      toast.success(`Bienvenido/a, ${data.user.nombre}`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: config.colorFondo || '#020617' }}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300"
    >
      {/* Background Decorative Glows */}
      <div
        style={{ backgroundColor: config.colorPrimario || '#06b6d4' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 opacity-10 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        style={{ backgroundColor: config.colorSecundario || '#4f46e5' }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 opacity-10 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div
        style={{ backgroundColor: config.colorSidebar ? `${config.colorSidebar}f2` : '#0f172ae6' }}
        className="w-full max-w-md border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-8">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow" />
          ) : (
            <div
              style={{
                background: `linear-gradient(to top right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'})`,
              }}
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4"
            >
              <Building2 className="w-9 h-9 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {config.nombreMunicipio || 'Tránsito Municipal'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {config.nombreSecretaria || 'Plataforma Institucional de Gestión Hexagonal'}
          </p>
          {config.lema && (
            <p className="text-[11px] text-cyan-400/90 italic mt-1 font-medium">
              "{config.lema}"
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                placeholder="usuario@transito.gov.co"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              style={{
                background: `linear-gradient(to right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'}, ${config.colorAcento || '#4f46e5'})`,
              }}
              className="w-full py-3.5 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Autenticando...' : 'Iniciar Sesión'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 justify-center text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Credenciales Demo Rápidas:
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 font-mono text-[11px] text-slate-400 flex flex-col gap-1">
            <div><span className="text-cyan-400 font-bold">ADMIN:</span> admin@transito.gov.co / admin123</div>
            <div><span className="text-blue-400 font-bold">FUNCIONARIO:</span> funcionario@transito.gov.co / func123</div>
            <div><span className="text-indigo-400 font-bold">CIUDADANO:</span> ciudadano@gmail.com / ciud123</div>
          </div>
        </div>
      </div>
    </div>
  );
};
