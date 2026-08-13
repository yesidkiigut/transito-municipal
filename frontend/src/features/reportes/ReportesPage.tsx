import { useState } from 'react';
import { BarChart3, Download, TrendingUp, ShieldAlert, FileCheck, Calendar, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export const ReportesPage: React.FC = () => {
  const [reportType, setReportType] = useState('tramites');

  const exportCSV = () => {
    toast.success('Reporte exportado exitosamente a formato CSV / Excel');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="text-cyan-400" size={26} />
            Módulo de Reportes e Indicadores
          </h1>
          <p className="text-sm text-slate-400">
            Estadísticas consolidadas del sistema de tránsito municipal.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:opacity-90 transition"
        >
          <FileSpreadsheet size={18} />
          Exportar a Excel / CSV
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Trámites Completados</span>
            <FileCheck className="text-emerald-400" size={18} />
          </div>
          <div className="text-3xl font-extrabold text-white">1,420 <span className="text-xs text-emerald-400 font-mono">+15% este mes</span></div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Comparendos Recaudados Ext.</span>
            <ShieldAlert className="text-rose-400" size={18} />
          </div>
          <div className="text-3xl font-extrabold text-white">$420M <span className="text-xs text-cyan-400 font-mono">COP</span></div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-[65%] rounded-full"></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
            <span>Asistencia a Citas (No-Show)</span>
            <Calendar className="text-blue-400" size={18} />
          </div>
          <div className="text-3xl font-extrabold text-white">92.4% <span className="text-xs text-emerald-400 font-mono">Eficiencia</span></div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[92%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Simulation Box */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white">Top 5 Infracciones Más Comunes este Mes</h2>
        <div className="space-y-4">
          {[
            { codigo: 'C29', desc: 'Conducir a velocidad superior a la máxima permitida', count: 342, pct: '85%' },
            { codigo: 'C02', desc: 'Estacionar un vehículo en sitios prohibidos', count: 210, pct: '55%' },
            { codigo: 'D02', desc: 'Conducir sin portar el seguro obligatorio (SOAT)', count: 180, pct: '45%' },
            { codigo: 'C35', desc: 'No realizar la revisión técnico-mecánica en el plazo legal', count: 145, pct: '38%' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200"><strong className="text-cyan-400">{item.codigo}</strong> - {item.desc}</span>
                <span className="text-slate-400 font-mono">{item.count} infracciones</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: item.pct }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
