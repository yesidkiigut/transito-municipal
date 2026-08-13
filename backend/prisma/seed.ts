import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado de datos iniciales para Tránsito Municipal...');

  // 1. Crear Usuarios base
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashFunc = await bcrypt.hash('func123', 10);
  const passwordHashCiud = await bcrypt.hash('ciud123', 10);

  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@transito.gov.co' },
    update: {},
    create: {
      email: 'admin@transito.gov.co',
      password: passwordHashAdmin,
      nombre: 'Administrador General',
      rol: 'ADMIN',
    },
  });

  const funcUser = await prisma.usuario.upsert({
    where: { email: 'funcionario@transito.gov.co' },
    update: {},
    create: {
      email: 'funcionario@transito.gov.co',
      password: passwordHashFunc,
      nombre: 'Carlos Pérez (Agente)',
      rol: 'FUNCIONARIO',
    },
  });

  const ciudUser = await prisma.usuario.upsert({
    where: { email: 'ciudadano@gmail.com' },
    update: {},
    create: {
      email: 'ciudadano@gmail.com',
      password: passwordHashCiud,
      nombre: 'Carlos Eduardo Mendoza',
      rol: 'CIUDADANO',
    },
  });

  // 2. Crear Tipos de Trámite parametrizados
  const tipoMatricula = await prisma.tipoTramite.upsert({
    where: { codigo: 'MATRICULA_INICIAL' },
    update: {},
    create: {
      codigo: 'MATRICULA_INICIAL',
      nombre: 'Matrícula Inicial de Vehículo',
      descripcion: 'Registro por primera vez de un vehículo en el parque automotor municipal.',
      requisitos: ['Factura de compra', 'Impuesto pago', 'SOAT Vigente'],
      tiempoMaximoResolucion: 3,
      areaResponsable: 'Registro Automotor',
    },
  });

  const tipoLicencia = await prisma.tipoTramite.upsert({
    where: { codigo: 'REEXPEDICION_LICENCIA' },
    update: {},
    create: {
      codigo: 'REEXPEDICION_LICENCIA',
      nombre: 'Expedición o Duplicado de Licencia',
      descripcion: 'Trámite de expedición inicial o duplicado por pérdida de licencia.',
      requisitos: ['Examen médico aprobado CRC', 'Paz y salvo de comparendos'],
      tiempoMaximoResolucion: 1,
      areaResponsable: 'Licencias de Conducción',
    },
  });

  // 3. Crear Tipos de Infracción (CNSV)
  await prisma.tipoInfraccion.upsert({
    where: { codigo: 'C29' },
    update: {},
    create: {
      codigo: 'C29',
      descripcion: 'Conducir un vehículo a velocidad superior a la máxima permitida.',
      grado: 2,
      valorBase: 650000,
      puntosDescuento: 3,
      articuloCNSV: 'Art. 131 C29',
    },
  });

  await prisma.tipoInfraccion.upsert({
    where: { codigo: 'F01' },
    update: {},
    create: {
      codigo: 'F01',
      descripcion: 'Conducir bajo la influencia del alcohol o sustancias psicoactivas.',
      grado: 4,
      valorBase: 2400000,
      puntosDescuento: 10,
      articuloCNSV: 'Art. 131 F01',
    },
  });

  console.log('✅ Sembrado completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el sembrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
