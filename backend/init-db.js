const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://transito:transito123@127.0.0.1:5433/transito_municipal?schema=public';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function initDatabase() {
  console.log('🚀 [AutoInit] Verificando e inicializando base de datos en Railway...');

  try {
    // 1. Compilar y registrar todos los Procedimientos Almacenados y Funciones PL/pgSQL
    const sqlDir = path.join(__dirname, 'prisma', 'sql');
    if (fs.existsSync(sqlDir)) {
      const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql')).sort();
      console.log(`⚙️ [AutoInit] Compilando ${files.length} Procedimientos Almacenados SQL...`);

      for (const file of files) {
        const filePath = path.join(sqlDir, file);
        const sqlContent = fs.readFileSync(filePath, 'utf-8');
        try {
          await prisma.$executeRawUnsafe(sqlContent);
          console.log(`  ✅ Compilado: ${file}`);
        } catch (sqlErr) {
          console.warn(`  ⚠️ Advertencia en ${file}:`, sqlErr.message);
        }
      }
    }

    // 2. Sembrado de Parámetros Anuales si no existen
    const paramsCount = await prisma.parametroAnual.count();
    if (paramsCount === 0) {
      console.log('🌱 [AutoInit] Sembrando Parámetros Anuales por defecto...');
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
    }

    // 3. Sembrado de Reglas de Descuento si no existen
    const reglasCount = await prisma.reglaDescuentoLey.count();
    if (reglasCount === 0) {
      console.log('🌱 [AutoInit] Sembrando Reglas de Descuento de Ley...');
      const reglasDescuento = [
        {
          codigo: 'DESCUENTO_50_CURSO',
          descripcion: '50% de descuento en comparendos pagando en los primeros 5 días hábiles con curso pedagógico',
          diasHabilesMin: 1,
          diasHabilesMax: 5,
          porcentajeDescuento: 50.0,
          requiereCurso: true,
          leyReferencia: 'Ley 769 de 2002 Art. 136',
          activo: true,
        },
        {
          codigo: 'DESCUENTO_25_CURSO',
          descripcion: '25% de descuento en comparendos pagando entre el día 6 y 20 hábil con curso pedagógico',
          diasHabilesMin: 6,
          diasHabilesMax: 20,
          porcentajeDescuento: 25.0,
          requiereCurso: true,
          leyReferencia: 'Ley 769 de 2002 Art. 136',
          activo: true,
        },
        {
          codigo: 'TARIFA_PLENA_SIN_MORA',
          descripcion: 'Pago al 100% de la tarifa sin intereses de mora (hasta el día 30 calendario)',
          diasHabilesMin: 21,
          diasHabilesMax: 30,
          porcentajeDescuento: 0.0,
          requiereCurso: false,
          leyReferencia: 'Ley 769 de 2002',
          activo: true,
        },
      ];
      for (const reg of reglasDescuento) {
        await prisma.reglaDescuentoLey.upsert({
          where: { codigo: reg.codigo },
          update: reg,
          create: reg,
        });
      }
    }

    // 4. Sembrado de Tasas de Mora si no existen
    const tasasCount = await prisma.tasaInteresMora.count();
    if (tasasCount === 0) {
      console.log('🌱 [AutoInit] Sembrando Tasas de Interés de Mora de la Superfinanciera...');
      const tasasMora = [
        { anio: 2025, mes: 1, tea: 27.5, tnm: 2.05, td: 0.0683, res: 'Resolución SFC 001/2025' },
        { anio: 2025, mes: 6, tea: 26.0, tnm: 1.95, td: 0.0650, res: 'Resolución SFC 060/2025' },
        { anio: 2025, mes: 12, tea: 25.0, tnm: 1.88, td: 0.0626, res: 'Resolución SFC 120/2025' },
        { anio: 2026, mes: 1, tea: 24.5, tnm: 1.84, td: 0.0613, res: 'Resolución SFC 001/2026' },
        { anio: 2026, mes: 3, tea: 23.8, tnm: 1.78, td: 0.0593, res: 'Resolución SFC 030/2026' },
        { anio: 2026, mes: 6, tea: 23.0, tnm: 1.72, td: 0.0573, res: 'Resolución SFC 075/2026' },
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
    }

    // 5. Sembrado de Usuarios y Datos de Prueba si no existen
    const userCount = await prisma.usuario.count();
    if (userCount === 0) {
      console.log('🌱 [AutoInit] Creando usuarios y datos iniciales de prueba...');
      const passwordHashAdmin = await bcrypt.hash('admin123', 10);
      const passwordHashCiud = await bcrypt.hash('ciud123', 10);

      await prisma.usuario.create({
        data: {
          email: 'admin@transito.gov.co',
          password: passwordHashAdmin,
          nombre: 'Administrador General',
          rol: 'ADMIN',
        },
      });

      const ciudUser = await prisma.usuario.create({
        data: {
          email: 'ciudadano@gmail.com',
          password: passwordHashCiud,
          nombre: 'Carlos Eduardo Mendoza',
          rol: 'CIUDADANO',
        },
      });

      const ciudadano = await prisma.ciudadano.create({
        data: {
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

      // Crear comparendo e impuesto vehicular de prueba
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

      await prisma.comparendo.upsert({
        where: { numeroComparendo: 'CMP-2026-001' },
        update: {},
        create: {
          numeroComparendo: 'CMP-2026-001',
          placaVehiculo: 'XYZ789',
          ciudadanoId: ciudadano.id,
          tipoInfraccionId: tipoC29.id,
          fechaInfraccion: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          lugarInfraccion: 'Av. Principal # 45-12',
          agenteTransitoId: 'agente-001',
          observaciones: 'Exceso de velocidad radar 85 km/h',
          evidencias: ['foto_radar.jpg'],
          estado: 'PENDIENTE',
          valorMulta: 650000,
          gradoInfraccion: 2,
          puntosDescuento: 3,
        },
      });
    }

    console.log('✅ [AutoInit] Base de datos e inicialización completadas con éxito.');
  } catch (err) {
    console.error('❌ [AutoInit] Error durante la inicialización:', err);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
