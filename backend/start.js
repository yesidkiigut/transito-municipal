const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || '3001';
const host = '0.0.0.0';

console.log(`🚀 [Railway Start] Iniciando backend de Tránsito Municipal en ${host}:${port}...`);

// 1. Ejecutar inicialización de Base de Datos
const initDbPath = path.join(__dirname, 'init-db.js');
if (fs.existsSync(initDbPath)) {
  try {
    const init = spawn('node', [initDbPath], {
      stdio: 'inherit',
      env: process.env,
    });

    init.on('error', (err) => {
      console.warn('⚠️ Advertencia en init-db:', err.message);
    });
  } catch (e) {
    console.warn('⚠️ No se pudo ejecutar init-db previo al arranque:', e.message);
  }
}

// 2. Localizar el binario de Next.js
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
const execCmd = fs.existsSync(nextBin) ? nextBin : 'next';

console.log(`⚡ Ejecutando Next.js usando binario: ${execCmd}`);

const nextProcess = spawn(
  execCmd,
  ['start', '-H', host, '-p', port],
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
  console.log(`Next.js finalizó con código ${code}`);
  process.exit(code || 0);
});
