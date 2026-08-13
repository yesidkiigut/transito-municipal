import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Landmark,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Receipt,
  Car,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Building2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ConceptoLiquidado {
  id: string;
  tipo: 'COMPARENDO' | 'IMPUESTO_VEHICULAR' | 'TRAMITE' | 'RODAMIENTO';
  referencia: string;
  descripcion: string;
  valorOriginal: number;
  descuentoLey: number;
  porcentajeDescuento: number;
  interesesMora: number;
  valorTotal: number;
  fechaVencimiento?: string;
  aplicaDescuentoCurso?: boolean;
}

interface BancoPSE {
  codigo: string;
  nombre: string;
  tipo: string;
}

export const PortalPagosPage: React.FC = () => {
  const { user } = useAuthStore();
  const { config } = useThemeStore();

  const [loading, setLoading] = useState(false);
  const [bancos, setBancos] = useState<BancoPSE[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoLiquidado[]>([]);
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState<string[]>([]);
  
  // Paso del Checkout: 1 = Liquidacion, 2 = Metodo de Pago, 3 = Procesando/QR, 4 = Exito
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [canalSeleccionado, setCanalSeleccionado] = useState<'PSE' | 'BRE_B'>('PSE');

  // Formulario PSE
  const [bancoPSE, setBancoPSE] = useState('1007');
  const [tipoPersona, setTipoPersona] = useState<'NATURAL' | 'JURIDICA'>('NATURAL');
  const [correoPagador, setCorreoPagador] = useState(user?.email || 'ciudadano@gmail.com');
  const [telefonoPagador, setTelefonoPagador] = useState('3105550199');

  // Formulario Bre-B
  const [tipoLlaveBreB, setTipoLlaveBreB] = useState<'NIT' | 'CELULAR' | 'CORREO'>('NIT');

  // Estado de Transacción Activa
  const [transaccionActiva, setTransaccionActiva] = useState<any>(null);
  const [temporizador, setTemporizador] = useState(600); // 10 min
  const [copiado, setCopiado] = useState(false);
  const [pollingActivo, setPollingActivo] = useState(false);

  // Cargar Liquidación Inicial y Bancos
  useEffect(() => {
    cargarLiquidacion();
    cargarBancos();
  }, []);

  // Temporizador para Bre-B
  useEffect(() => {
    let interval: any = null;
    if (paso === 3 && temporizador > 0) {
      interval = setInterval(() => setTemporizador((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [paso, temporizador]);

  const cargarLiquidacion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/pagos/liquidar?documento=${user?.email || 'admin@transito.gov.co'}`);
      const data = await res.json();
      if (res.ok && data.conceptos) {
        setConceptos(data.conceptos);
        // Seleccionar todos por defecto
        setConceptosSeleccionados(data.conceptos.map((c: ConceptoLiquidado) => c.id));
      }
    } catch (err) {
      toast.error('Error al cargar liquidaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const cargarBancos = async () => {
    try {
      const res = await fetch('/api/v1/pagos/bancos-pse');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBancos(data);
      }
    } catch (err) {
      console.error('Error al cargar lista de bancos');
    }
  };

  const toggleSeleccion = (id: string) => {
    if (conceptosSeleccionados.includes(id)) {
      setConceptosSeleccionados(conceptosSeleccionados.filter((i) => i !== id));
    } else {
      setConceptosSeleccionados([...conceptosSeleccionados, id]);
    }
  };

  const conceptosFiltrados = conceptos.filter((c) => conceptosSeleccionados.includes(c.id));
  const subtotal = conceptosFiltrados.reduce((sum, c) => sum + c.valorOriginal, 0);
  const totalDescuentos = conceptosFiltrados.reduce((sum, c) => sum + c.descuentoLey, 0);
  const totalPagar = conceptosFiltrados.reduce((sum, c) => sum + c.valorTotal, 0);

  const handleIniciarPago = async () => {
    if (conceptosFiltrados.length === 0) {
      toast.error('Selecciona al menos un concepto a pagar');
      return;
    }

    setLoading(true);
    try {
      const payloadConceptos = conceptosFiltrados.map((c) => ({
        tipoConcepto: c.tipo === 'RODAMIENTO' ? 'RODAMIENTO_MUNICIPAL' : c.tipo,
        referenciaConcepto: c.referencia,
        descripcion: c.descripcion,
        codigoContable: c.tipo === 'COMPARENDO' ? '2.1.2.02.02' : '2.1.1.01',
        valorBase: c.valorOriginal,
        descuento: c.descuentoLey,
        interesesMora: c.interesesMora,
        valorFinal: c.valorTotal,
      }));

      if (canalSeleccionado === 'PSE') {
        const res = await fetch('/api/v1/pagos/iniciar-pse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ciudadanoId: user?.id || 'CIUD-DEMO-001',
            bancoCodigo: bancoPSE,
            tipoPersona,
            correoPagador,
            telefonoPagador,
            conceptos: payloadConceptos,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al iniciar PSE');

        setTransaccionActiva(data);
        setPaso(3);
        toast.success('Transacción PSE generada con éxito');
      } else {
        // Bre-B Banco de la República
        const res = await fetch('/api/v1/pagos/iniciar-bre-b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ciudadanoId: user?.id || 'CIUD-DEMO-001',
            tipoLlave: tipoLlaveBreB,
            correoPagador,
            conceptos: payloadConceptos,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al iniciar Bre-B');

        setTransaccionActiva(data);
        setPaso(3);
        setTemporizador(600);
        toast.success('Código QR Interoperable Bre-B generado');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSimularAprobacion = async () => {
    if (!transaccionActiva) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/pagos/simular-aprobacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenciaPago: transaccionActiva.referenciaPago,
          cus: transaccionActiva.cus || `CUS-PSE-${Date.now()}`,
          codigoTrazabilidad: `BANREP-BREB-OK-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al simular');

      setTransaccionActiva(data.transaccion);
      setPaso(4);
      toast.success('¡Pago Aprobado y descargado exitosamente en el sistema municipal!');
    } catch (err: any) {
      toast.error(err.message || 'Error al aprobar transacción');
    } finally {
      setLoading(false);
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/70 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-3.5 py-1 rounded-full shadow-inner">
            <Landmark size={14} className="text-cyan-400" /> Pasarela Multicanal PSE & Bre-B (Banco de la República)
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portal Oficial de Pagos & Recaudo Municipal
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Liquida y paga en línea tus comparendos de tránsito con descuentos de Ley, impuesto vehicular anual y tasas municipales con confirmación inmediata e integración contable directa con <strong>HASSQL</strong>.
          </p>
        </div>
      </div>

      {/* Indicador de Pasos del Checkout */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { num: 1, label: '1. Liquidación de Conceptos' },
          { num: 2, label: '2. Medio de Pago' },
          { num: 3, label: '3. Procesamiento & QR' },
          { num: 4, label: '4. Comprobante Oficial' },
        ].map((item) => (
          <div
            key={item.num}
            style={{
              borderColor: paso >= item.num ? config.colorPrimario || '#06b6d4' : undefined,
            }}
            className={`p-3 rounded-2xl border text-center transition-all ${
              paso === item.num
                ? 'bg-cyan-950/40 text-cyan-300 font-bold shadow-lg'
                : paso > item.num
                ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/50'
                : 'bg-slate-900/40 text-slate-500 border-slate-800'
            }`}
          >
            <div className="text-xs sm:text-sm">{item.label}</div>
          </div>
        ))}
      </div>

      {/* PASO 1: LIQUIDACIÓN DE CONCEPTOS */}
      {paso === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listado de Obligaciones Pendientes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="text-cyan-400" size={18} />
                  Obligaciones Pendientes de Pago
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {conceptosSeleccionados.length} de {conceptos.length} seleccionados
                </span>
              </div>

              <div className="space-y-3">
                {conceptos.map((item) => {
                  const seleccionado = conceptosSeleccionados.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSeleccion(item.id)}
                      style={{
                        borderColor: seleccionado ? `${config.colorPrimario || '#06b6d4'}80` : undefined,
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start justify-between gap-4 ${
                        seleccionado
                          ? 'bg-slate-950/90 shadow-md ring-1 ring-cyan-500/20'
                          : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400">{item.referencia}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.tipo === 'COMPARENDO'
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : 'bg-blue-950 text-blue-300 border-blue-800'
                              }`}
                            >
                              {item.tipo}
                            </span>
                            {item.descuentoLey > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse">
                                -{item.porcentajeDescuento}% DTO. LEY
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-100">{item.descripcion}</p>
                          {item.aplicaDescuentoCurso && (
                            <p className="text-[11px] text-amber-400 flex items-center gap-1">
                              <Sparkles size={12} /> Incluye beneficio por curso pedagógico (Ley 769 / 2161)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {item.descuentoLey > 0 && (
                          <div className="text-[11px] text-slate-500 line-through">
                            ${item.valorOriginal.toLocaleString('es-CO')}
                          </div>
                        )}
                        <div className="text-base font-extrabold text-white">
                          ${item.valorTotal.toLocaleString('es-CO')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resumen de Liquidación & Botón Continuar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Receipt className="text-cyan-400" size={18} /> Resumen de Liquidación
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Conceptos:</span>
                  <span className="font-mono text-slate-200 font-bold">${subtotal.toLocaleString('es-CO')}</span>
                </div>

                {totalDescuentos > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Descuentos de Ley:</span>
                    <span className="font-mono">-${totalDescuentos.toLocaleString('es-CO')}</span>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Total a Pagar:</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    ${totalPagar.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  disabled={conceptosFiltrados.length === 0}
                  style={{
                    background: `linear-gradient(to right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'})`,
                  }}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  Continuar al Pago <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" /> Seguridad & Trazabilidad HASSQL
              </div>
              <p className="text-[11px] leading-relaxed">
                Cada pago genera un Código Único de Seguimiento (CUS) y queda registrado en tiempo real para conciliación automática con la Tesorería Municipal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PASO 2: SELECCIÓN DE CANAL DE PAGO (PSE VS BRE-B) */}
      {paso === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="text-cyan-400" size={18} />
                Selecciona tu Canal de Pago
              </h3>
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                ← Volver a liquidación
              </button>
            </div>

            {/* Selector de Tabs PSE vs Bre-B */}
            <div className="grid grid-cols-2 gap-4">
              {/* PSE */}
              <div
                onClick={() => setCanalSeleccionado('PSE')}
                style={{
                  borderColor: canalSeleccionado === 'PSE' ? config.colorPrimario || '#06b6d4' : undefined,
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  canalSeleccionado === 'PSE'
                    ? 'bg-slate-950 shadow-lg ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">PSE (ACH Colombia)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                    Bancos Tradicionales
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Débito automático desde tu cuenta corriente o de ahorros de cualquier banco nacional.
                </p>
              </div>

              {/* Bre-B */}
              <div
                onClick={() => setCanalSeleccionado('BRE_B')}
                style={{
                  borderColor: canalSeleccionado === 'BRE_B' ? config.colorPrimario || '#06b6d4' : undefined,
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  canalSeleccionado === 'BRE_B'
                    ? 'bg-slate-950 shadow-lg ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="text-amber-400" size={16} /> Bre-B (BanRep)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    Instantáneo 24/7
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Pago inmediato interoperable con QR o Llave desde cualquier billetera o app bancaria.
                </p>
              </div>
            </div>

            {/* Formulario de PSE */}
            {canalSeleccionado === 'PSE' && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Selecciona tu Entidad Financiera *
                    </label>
                    <select
                      value={bancoPSE}
                      onChange={(e) => setBancoPSE(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {bancos.map((b) => (
                        <option key={b.codigo} value={b.codigo}>
                          {b.nombre} ({b.tipo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Tipo de Persona *
                    </label>
                    <select
                      value={tipoPersona}
                      onChange={(e) => setTipoPersona(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="NATURAL">Persona Natural</option>
                      <option value="JURIDICA">Persona Jurídica (Empresa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Correo Electrónico de Registro en PSE *
                    </label>
                    <input
                      type="email"
                      required
                      value={correoPagador}
                      onChange={(e) => setCorreoPagador(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                      placeholder="usuario@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Teléfono Celular de Contacto *
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefonoPagador}
                      onChange={(e) => setTelefonoPagador(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                      placeholder="310 555 0199"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de Bre-B */}
            {canalSeleccionado === 'BRE_B' && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles size={14} /> Sistema Interoperable de Pagos Inmediatos (Bre-B Banco de la República)
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Al presionar pagar, generaremos un <strong>QR Interoperable Bre-B</strong> que podrás escanear desde cualquier app bancaria colombiana (Nequi, Daviplata, Bancolombia, Banco de Bogotá, etc.) con confirmación en menos de 20 segundos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resumen y Botón Pagar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Receipt className="text-cyan-400" size={18} /> Confirmar Pago
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Canal Elegido:</span>
                  <span className="font-bold text-white">{canalSeleccionado === 'PSE' ? 'PSE ACH' : 'Bre-B BanRep'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Conceptos a Pagar:</span>
                  <span className="font-bold text-white">{conceptosFiltrados.length}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Monto Total:</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    ${totalPagar.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleIniciarPago}
                disabled={loading}
                style={{
                  background: `linear-gradient(to right, ${config.colorPrimario || '#06b6d4'}, ${config.colorSecundario || '#2563eb'})`,
                }}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Generando Transacción...' : `Pagar con ${canalSeleccionado === 'PSE' ? 'PSE' : 'Bre-B'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 3: PROCESAMIENTO & QR / SIMULADOR SANDBOX */}
      {paso === 3 && transaccionActiva && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-6 text-center">
          {canalSeleccionado === 'BRE_B' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-amber-300 bg-amber-950/90 border border-amber-800 px-3.5 py-1 rounded-full">
                  <Sparkles size={14} /> Escanea con cualquier App Bancaria
                </span>
                <h3 className="text-2xl font-extrabold text-white">Código QR Dinámico Bre-B</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Abre Nequi, Bancolombia, Daviplata o la app de tu banco, selecciona <strong>Pagar con QR / Bre-B</strong> y escanea el código.
                </p>
              </div>

              {/* QR Code Mockup de Alta Fidelidad */}
              <div className="p-6 bg-white rounded-3xl max-w-[260px] mx-auto shadow-2xl border-4 border-slate-800 relative group">
                <div className="aspect-square bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <QrCode size={180} className="text-cyan-400" />
                  <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-950 font-black text-xs">
                      Bre-B
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-800 font-extrabold mt-2 font-mono">
                  REF: {transaccionActiva.referenciaPago}
                </div>
              </div>

              {/* Llave Bre-B & Tiempo de Expiración */}
              <div className="grid grid-cols-2 gap-3 text-xs max-w-md mx-auto">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Llave Institucional (NIT):</span>
                  <div className="font-mono font-bold text-amber-400 flex items-center justify-between mt-1">
                    <span>{transaccionActiva.llaveBreB || '890.123.456-7'}</span>
                    <button
                      onClick={() => copiarAlPortapapeles(transaccionActiva.llaveBreB || '8901234567')}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copiado ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Tiempo Restante:</span>
                  <div className="font-mono font-bold text-rose-400 flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    <span>
                      {Math.floor(temporizador / 60)}:{(temporizador % 60).toString().padStart(2, '0')} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de Simulación de Aprobación para Sandbox */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/50 space-y-3">
                <span className="text-xs text-cyan-300 font-bold flex items-center justify-center gap-1.5">
                  <RefreshCw size={14} className="animate-spin" /> Esperando confirmación inmediata de la red Bre-B...
                </span>
                <button
                  type="button"
                  onClick={handleSimularAprobacion}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 size={16} /> [Sandbox] Simular Pago Exitoso Bre-B
                </button>
              </div>
            </div>
          ) : (
            /* PSE Procesando */
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase text-blue-300 bg-blue-950/90 border border-blue-800 px-3.5 py-1 rounded-full">
                  <Landmark size={14} /> Redirección Segura a PSE ACH
                </span>
                <h3 className="text-2xl font-extrabold text-white">Transacción en Proceso</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Se ha generado la referencia única de recaudo para el débito bancario.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3 text-left max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Referencia de Pago:</span>
                  <span className="font-mono font-bold text-cyan-400">{transaccionActiva.referenciaPago}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Código CUS:</span>
                  <span className="font-mono font-bold text-slate-200">{transaccionActiva.cus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Total:</span>
                  <span className="font-mono font-extrabold text-white">
                    ${transaccionActiva.montoTotal.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/50 space-y-3">
                <button
                  type="button"
                  onClick={handleSimularAprobacion}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 size={16} /> [Sandbox] Confirmar Débito Bancario Exitoso
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 4: COMPROBANTE OFICIAL & PAZ Y SALVO */}
      {paso === 4 && transaccionActiva && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/95 border border-emerald-500/50 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-extrabold text-white">¡Pago Aprobado y Registrado!</h3>
            <p className="text-xs text-slate-300">
              Tus obligaciones han sido descargadas en el sistema municipal y enviadas al módulo contable <strong>HASSQL</strong>.
            </p>
          </div>

          {/* Recibo Oficial Estilizado */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <div className="font-extrabold text-sm text-white">{config.nombreMunicipio}</div>
                <div className="text-[11px] text-slate-400">{config.nombreSecretaria}</div>
                <div className="text-[10px] text-slate-500 font-mono">NIT: {config.nitAlcaldia}</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold font-mono">
                  {transaccionActiva.reciboOficialNumero || 'REC-TRM-2026-00912'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">CUS / Trazabilidad:</span>
                <p className="font-mono text-cyan-400 font-bold mt-0.5">{transaccionActiva.cus || transaccionActiva.codigoTrazabilidad}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Canal de Pago:</span>
                <p className="font-bold text-white mt-0.5">{transaccionActiva.canalPago}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Fecha y Hora:</span>
                <p className="font-mono text-slate-300 mt-0.5">{new Date().toLocaleString('es-CO')}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Recaudado:</span>
                <p className="font-mono font-extrabold text-emerald-400 text-sm mt-0.5">
                  ${(transaccionActiva.montoTotal || totalPagar).toLocaleString('es-CO')} COP
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck size={15} /> Paz y Salvo Oficial Expedido
              </span>
              <span className="font-mono text-[10px] text-slate-500">Interfase HASSQL: Lista para Sync</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Download size={15} /> Descargar Comprobante PDF
            </button>

            <button
              type="button"
              onClick={() => {
                setPaso(1);
                cargarLiquidacion();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              Realizar Otra Liquidación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
