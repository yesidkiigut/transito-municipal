import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado de datos normativos y procedimientos para Tránsito Municipal...');

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

  // 2. Crear o actualizar Ciudadano base
  const ciudadano = await prisma.ciudadano.upsert({
    where: { numeroDocumento: '1020304050' },
    update: {},
    create: {
      usuarioId: ciudUser.id,
      tipoDocumento: 'CC',
      numeroDocumento: '1020304050',
      nombres: 'Carlos Eduardo',
      apellidos: 'Mendoza López',
      fechaNacimiento: new Date('1990-05-15'),
      correo: 'ciudadano@gmail.com',
      telefono: '3101234567',
      via: 'Calle 45',
      numero1: '12',
      numero2: '34',
      barrio: 'Centro',
      ciudad: 'Municipio Capital',
      departamento: 'Cundinamarca',
      estado: 'ACTIVO',
    },
  });

  // 3. Crear Vehículo de prueba
  const vehiculo = await prisma.vehiculo.upsert({
    where: { placa: 'XYZ789' },
    update: {},
    create: {
      placa: 'XYZ789',
      marca: 'Chevrolet',
      linea: 'Onix Turbo',
      modelo: 2023,
      cilindraje: 1000,
      color: 'Gris Mercurio',
      tipoVehiculo: 'AUTOMOVIL',
      claseServicio: 'PARTICULAR',
      numeroMotor: 'MOT-987654321',
      numeroChasis: 'CHS-123456789',
      fechaMatricula: new Date('2023-02-10'),
      estado: 'ACTIVO',
    },
  });

  // Asociar propietario
  await prisma.vehiculoPropietario.upsert({
    where: {
      vehiculoId_ciudadanoId_fechaInicio: {
        vehiculoId: vehiculo.id,
        ciudadanoId: ciudadano.id,
        fechaInicio: new Date('2023-02-10'),
      },
    },
    update: {},
    create: {
      vehiculoId: vehiculo.id,
      ciudadanoId: ciudadano.id,
      fechaInicio: new Date('2023-02-10'),
      esActual: true,
    },
  });

  // 4. Parámetros Anuales Normativos (UVT, SMMLV, Sanción mínima)
  const parametros = [
    { vigenciaFiscal: 2024, uvtValor: 47065, smmlvValor: 1300000, sancionMinimaMora: 235000, fechaLimiteProntoPago: new Date('2024-05-31') },
    { vigenciaFiscal: 2025, uvtValor: 49799, smmlvValor: 1423500, sancionMinimaMora: 249000, fechaLimiteProntoPago: new Date('2025-05-31') },
    { vigenciaFiscal: 2026, uvtValor: 52380, smmlvValor: 1530000, sancionMinimaMora: 262000, fechaLimiteProntoPago: new Date('2026-05-31') },
  ];

  for (const p of parametros) {
    await prisma.parametroAnual.upsert({
      where: { vigenciaFiscal: p.vigenciaFiscal },
      update: p,
      create: {
        ...p,
        porcentajeDescuentoProntoPago: 10.0,
        valorCursoPedagogico: 0,
        activo: true,
      },
    });
  }

  // 5. Histórico de Tasas de Interés de Mora (Superfinanciera)
  const tasasMora = [
    // 2025
    { anio: 2025, mes: 1, tea: 27.5, tnm: 2.05, td: 0.0683, res: 'Resolución SFC 001/2025' },
    { anio: 2025, mes: 2, tea: 27.2, tnm: 2.03, td: 0.0676, res: 'Resolución SFC 012/2025' },
    { anio: 2025, mes: 3, tea: 26.9, tnm: 2.01, td: 0.0670, res: 'Resolución SFC 025/2025' },
    { anio: 2025, mes: 6, tea: 26.0, tnm: 1.95, td: 0.0650, res: 'Resolución SFC 060/2025' },
    { anio: 2025, mes: 12, tea: 25.0, tnm: 1.88, td: 0.0626, res: 'Resolución SFC 120/2025' },
    // 2026
    { anio: 2026, mes: 1, tea: 24.5, tnm: 1.84, td: 0.0613, res: 'Resolución SFC 001/2026' },
    { anio: 2026, mes: 2, tea: 24.0, tnm: 1.80, td: 0.0600, res: 'Resolución SFC 015/2026' },
    { anio: 2026, mes: 3, tea: 23.8, tnm: 1.78, td: 0.0593, res: 'Resolución SFC 030/2026' },
    { anio: 2026, mes: 4, tea: 23.5, tnm: 1.76, td: 0.0586, res: 'Resolución SFC 045/2026' },
    { anio: 2026, mes: 5, tea: 23.2, tnm: 1.74, td: 0.0580, res: 'Resolución SFC 060/2026' },
    { anio: 2026, mes: 6, tea: 23.0, tnm: 1.72, td: 0.0573, res: 'Resolución SFC 075/2026' },
    { anio: 2026, mes: 7, tea: 22.8, tnm: 1.71, td: 0.0570, res: 'Resolución SFC 090/2026' },
    { anio: 2026, mes: 8, tea: 22.5, tnm: 1.69, td: 0.0563, res: 'Resolución SFC 105/2026' },
  ];

  for (const t of tasasMora) {
    await prisma.tasaInteresMora.upsert({
      where: { anio_mes: { anio: t.anio, mes: t.mes } },
      update: {
        tasaEfectivaAnual: t.tea,
        tasaNominalMensual: t.tnm,
        tasaDiaria: t.td,
        resolucionSuperfinanciera: t.res,
      },
      create: {
        anio: t.anio,
        mes: t.mes,
        tasaEfectivaAnual: t.tea,
        tasaNominalMensual: t.tnm,
        tasaDiaria: t.td,
        resolucionSuperfinanciera: t.res,
        activo: true,
      },
    });
  }

  // 6. Rangos de Avalúo y Tarifas de Impuesto Vehicular (Ley 488 de 1998)
  const rangosTarifas = [
    { vigenciaFiscal: 2026, rangoDesdeUVT: 0, rangoHastaUVT: 1184, porcentajeTarifa: 1.5, descripcion: 'Hasta 1.184 UVT (~$62M): Tarifa 1.5%' },
    { vigenciaFiscal: 2026, rangoDesdeUVT: 1184, rangoHastaUVT: 2664, porcentajeTarifa: 2.5, descripcion: 'De 1.184 a 2.664 UVT (~$62M a $139M): Tarifa 2.5%' },
    { vigenciaFiscal: 2026, rangoDesdeUVT: 2664, rangoHastaUVT: 999999, porcentajeTarifa: 3.5, descripcion: 'Más de 2.664 UVT (> $139M): Tarifa 3.5%' },
  ];

  for (const r of rangosTarifas) {
    await prisma.rangoTarifaImpuesto.upsert({
      where: { vigenciaFiscal_rangoDesdeUVT: { vigenciaFiscal: r.vigenciaFiscal, rangoDesdeUVT: r.rangoDesdeUVT } },
      update: r,
      create: r,
    });
  }

  // 7. Reglas de Descuentos por Ley (Ley 769 de 2002 / Ley 2161)
  const reglasDescuento = [
    {
      codigo: 'DESCUENTO_50_CURSO',
      descripcion: '50% de descuento en comparendos pagando en los primeros 5 días hábiles con curso pedagógico',
      diasHabilesMin: 1,
      diasHabilesMax: 5,
      porcentajeDescuento: 50.0,
      requiereCurso: true,
    },
    {
      codigo: 'DESCUENTO_25_CURSO',
      descripcion: '25% de descuento en comparendos pagando entre el día 6 y 20 hábil con curso pedagógico',
      diasHabilesMin: 6,
      diasHabilesMax: 20,
      porcentajeDescuento: 25.0,
      requiereCurso: true,
    },
    {
      codigo: 'TARIFA_PLENA_SIN_MORA',
      descripcion: 'Pago al 100% de la tarifa sin intereses de mora (hasta el día 30 calendario)',
      diasHabilesMin: 21,
      diasHabilesMax: 30,
      porcentajeDescuento: 0.0,
      requiereCurso: false,
    },
  ];

  for (const reg of reglasDescuento) {
    await prisma.reglaDescuentoLey.upsert({
      where: { codigo: reg.codigo },
      update: reg,
      create: {
        ...reg,
        leyReferencia: 'Ley 769 de 2002 Art. 136',
        activo: true,
      },
    });
  }

  // 8. Tarifas de Rodamiento Municipal
  const tarifasRodamiento = [
    { vigenciaAnio: 2026, tipoVehiculo: 'AUTOMOVIL' as const, claseServicio: 'PARTICULAR' as const, valorTasa: 75000 },
    { vigenciaAnio: 2026, tipoVehiculo: 'MOTOCICLETA' as const, claseServicio: 'PARTICULAR' as const, valorTasa: 35000 },
    { vigenciaAnio: 2026, tipoVehiculo: 'BUS' as const, claseServicio: 'PUBLICO' as const, valorTasa: 120000 },
    { vigenciaAnio: 2026, tipoVehiculo: 'CAMION' as const, claseServicio: 'PUBLICO' as const, valorTasa: 150000 },
  ];

  for (const tr of tarifasRodamiento) {
    await prisma.tarifaRodamiento.upsert({
      where: {
        vigenciaAnio_tipoVehiculo_claseServicio: {
          vigenciaAnio: tr.vigenciaAnio,
          tipoVehiculo: tr.tipoVehiculo,
          claseServicio: tr.claseServicio,
        },
      },
      update: tr,
      create: tr,
    });
  }

  // 9. Tipos de Infracción
  const tipoC29 = await prisma.tipoInfraccion.upsert({
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

  const tipoF01 = await prisma.tipoInfraccion.upsert({
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

  // 10. Comparendos de prueba para verificar liquidación
  await prisma.comparendo.upsert({
    where: { numeroComparendo: 'CMP-2026-001' },
    update: {},
    create: {
      numeroComparendo: 'CMP-2026-001',
      placaVehiculo: 'XYZ789',
      ciudadanoId: ciudadano.id,
      tipoInfraccionId: tipoC29.id,
      fechaInfraccion: new Date(Date.now() - 4 * 24 * 3600 * 1000), // Hace 4 días (aplica 50% con curso)
      lugarInfraccion: 'Av. Principal # 45-12',
      agenteTransitoId: funcUser.id,
      observaciones: 'Exceso de velocidad radar 85 km/h en zona de 50 km/h',
      evidencias: ['foto_radar_1.jpg'],
      estado: 'PENDIENTE',
      valorMulta: 650000,
      gradoInfraccion: 2,
      puntosDescuento: 3,
    },
  });

  await prisma.comparendo.upsert({
    where: { numeroComparendo: 'CMP-2025-999' },
    update: {},
    create: {
      numeroComparendo: 'CMP-2025-999',
      placaVehiculo: 'XYZ789',
      ciudadanoId: ciudadano.id,
      tipoInfraccionId: tipoF01.id,
      fechaInfraccion: new Date('2025-06-15'), // En mora histórica
      lugarInfraccion: 'Calle 10 con Carrera 5',
      agenteTransitoId: funcUser.id,
      observaciones: 'Prueba de alcoholemia positiva grado 2',
      evidencias: ['dictamen_alcoholemia.pdf'],
      estado: 'PENDIENTE',
      valorMulta: 2400000,
      gradoInfraccion: 4,
      puntosDescuento: 10,
    },
  });

  // 11. Impuesto Vehicular de prueba
  await prisma.impuestoVehicular.upsert({
    where: { id: 'imp-xyz789-2026' },
    update: {},
    create: {
      id: 'imp-xyz789-2026',
      placaVehiculo: 'XYZ789',
      vigenciaFiscal: 2026,
      avaluoComercial: 68500000,
      valorBaseImpuesto: 1712500,
      sancionMora: 0,
      interesesMora: 0,
      descuentoProntoPago: 171250,
      valorTotalPagar: 1541250,
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2026-05-31'),
    },
  });

  // 12. Cargar y compilar Procedimientos Almacenados y Funciones PL/pgSQL
  console.log('⚙️ Compilando Procedimientos Almacenados y Funciones PL/pgSQL...');
  const sqlDir = path.join(__dirname, 'sql');

  if (fs.existsSync(sqlDir)) {
    const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const filePath = path.join(sqlDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`  -> Ejecutando ${file}...`);
      await prisma.$executeRawUnsafe(sqlContent);
    }
  }

  console.log('✅ Sembrado y compilación de Procedimientos Almacenados completados con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el sembrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
