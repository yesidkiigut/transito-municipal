import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';
import { GuardarConfiguracionHassqlSchema } from '@/application/dto/hassql/HassqlDTOs';
import { ConfiguracionHassql } from '@/domain/entities/ConfiguracionHassql';

export async function GET() {
  try {
    let config = await prisma.configuracionHassql.findFirst({
      where: { activo: true },
    });

    if (!config) {
      const defecto = ConfiguracionHassql.crearDefecto();
      config = await prisma.configuracionHassql.create({
        data: {
          servidorHost: defecto.servidorHost,
          puerto: defecto.puerto,
          baseDatos: defecto.baseDatos,
          usuario: defecto.usuario,
          password: defecto.password,
          tipoConexion: defecto.tipoConexion,
          tokenApi: defecto.tokenApi,
          endpointRecaudo: defecto.endpointRecaudo,
          horaCierreFiscal: defecto.horaCierreFiscal,
          activo: defecto.activo,
          autoSincronizar: defecto.autoSincronizar,
          formatoAsobancaria: defecto.formatoAsobancaria,
          codigoEntidadHassql: defecto.codigoEntidadHassql,
          cuentaBancariaRecaudo: defecto.cuentaBancariaRecaudo,
        },
      });
    }

    // Ocultar password en respuesta JSON
    const safeConfig = { ...config, password: '••••••••••••' };
    return NextResponse.json(safeConfig);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener configuración de HASSQL' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validacion = GuardarConfiguracionHassqlSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos de configuración de HASSQL inválidos', detalles: validacion.error.format() },
        { status: 400 }
      );
    }

    const existente = await prisma.configuracionHassql.findFirst({
      where: { activo: true },
    });

    let configGuardada;
    if (existente) {
      configGuardada = await prisma.configuracionHassql.update({
        where: { id: existente.id },
        data: {
          servidorHost: validacion.data.servidorHost,
          puerto: validacion.data.puerto,
          baseDatos: validacion.data.baseDatos,
          usuario: validacion.data.usuario,
          password: validacion.data.password.includes('•••') ? existente.password : validacion.data.password,
          tipoConexion: validacion.data.tipoConexion,
          tokenApi: validacion.data.tokenApi,
          endpointRecaudo: validacion.data.endpointRecaudo,
          horaCierreFiscal: validacion.data.horaCierreFiscal,
          activo: validacion.data.activo,
          autoSincronizar: validacion.data.autoSincronizar,
          formatoAsobancaria: validacion.data.formatoAsobancaria,
          codigoEntidadHassql: validacion.data.codigoEntidadHassql,
          cuentaBancariaRecaudo: validacion.data.cuentaBancariaRecaudo,
        },
      });
    } else {
      configGuardada = await prisma.configuracionHassql.create({
        data: validacion.data,
      });
    }

    return NextResponse.json({ ...configGuardada, password: '••••••••••••' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al guardar configuración de HASSQL' },
      { status: 500 }
    );
  }
}
