import React, { useState, useEffect } from 'react';
import { Settings, Shield, X, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const PasarelaConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [configData, setConfigData] = useState({
    proveedor: 'PSE',
    merchantId: 'MCH-TRANSITO-MUNICIPAL-2026',
    publicKey: 'pse_pk_test_9876543210',
    secretKey: 'pse_sk_test_1234567890',
    sandboxMode: true,
    webhookSecret: 'whsec_pse_transito_2026',
  });

  const cargarConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/pasarela/config');
      const data = await res.json();
      if (res.ok && data) {
        setConfigData({
          proveedor: data.proveedor || 'PSE',
          merchantId: data.merchantId || '',
          publicKey: data.publicKey || '',
          secretKey: data.secretKey || '',
          sandboxMode: data.sandboxMode ?? true,
          webhookSecret: data.webhookSecret || '',
        });
      }
    } catch (err) {
      toast.error('Error al cargar configuración de pasarela');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) cargarConfig();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/pasarela/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      toast.success('Configuración de Pasarela PSE guardada en base de datos');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar credenciales');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-cyan-400" size={20} />
            Configurar Pasarela de Pagos (PSE / Wompi)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor de Pasarela *</label>
            <select
              value={configData.proveedor}
              onChange={(e) => setConfigData({ ...configData, proveedor: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="PSE">PSE (Pagos Seguros en Línea / ACH)</option>
              <option value="WOMPI">Wompi Bancolombia</option>
              <option value="MERCADOPAGO">MercadoPago Colombia</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant ID *</label>
              <input
                type="text"
                required
                value={configData.merchantId}
                onChange={(e) => setConfigData({ ...configData, merchantId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Secret</label>
              <input
                type="text"
                value={configData.webhookSecret}
                onChange={(e) => setConfigData({ ...configData, webhookSecret: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Public Key (Llave Pública) *</label>
            <input
              type="text"
              required
              value={configData.publicKey}
              onChange={(e) => setConfigData({ ...configData, publicKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Secret Key (Llave Privada) *</label>
            <input
              type="password"
              required
              value={configData.secretKey}
              onChange={(e) => setConfigData({ ...configData, secretKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-slate-200">Modo de Pruebas (Sandbox)</span>
              <p className="text-[11px] text-slate-400">Alterna entre ambiente de prueba y producción real de PSE.</p>
            </div>
            <input
              type="checkbox"
              checked={configData.sandboxMode}
              onChange={(e) => setConfigData({ ...configData, sandboxMode: e.target.checked })}
              className="w-5 h-5 accent-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Pasarela'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
