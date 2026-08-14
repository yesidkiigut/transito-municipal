const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || '3001';
const host = '0.0.0.0';

console.log(`🚀 [Railway Start] Iniciando backend de Tránsito Municipal en ${host}:${port}...`);

// 1. Ejecutar inicialización de Base de Datos de forma asíncrona y segura
try {
  const init = spawn('node', [path.join(__dirname, 'init-db.js')], {
    stdio: 'inherit',
    env: process.env,
  });

  init.on('error', (err) => {
    console.warn('⚠️ Advertencia en init-db:', err.message);
  });
} catch (e) {
  console.warn('⚠️ No se pudo ejecutar init-db previo al arranque:', e.message);
}

// 2. Iniciar Next.js en el host 0.0.0.0 y puerto asignado por Railway
const nextProcess = spawn(
  'npx',
  ['next', 'start', '-H', host, '-p', port],
  {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  }
);

nextProcess.on('error', (err) => {
  console.error('❌ Error crítico al arrancar Next.js:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`Next.js terminó con código ${code}`);
  process.exit(code || 0);
});
