import React from 'react';

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '3rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ color: '#06b6d4' }}>🏛️ Tránsito Municipal - API Backend</h1>
      <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
        Servicio backend de liquidación normativa, convenios de pago y recaudación en línea 100% operativo.
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#10b981' }}>
          ● Estado del Servicio: <strong>ACTIVO Y OPERATIVO (HTTP 200)</strong>
        </p>
      </div>
    </main>
  );
}
