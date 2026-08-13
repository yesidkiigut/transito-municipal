import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';

export async function GET() {
  try {
    let config = await prisma.configuracionPasarela.findFirst({
      where: { activo: true },
    });

    if (!config) {
      config = await prisma.configuracionPasarela.create({
        data: {
          proveedor: 'PSE',
          merchantId: 'MCH-TRANSITO-MUNICIPAL-2026',
          publicKey: 'pse_pk_test_9876543210',
          secretKey: 'pse_sk_test_1234567890',
          sandboxMode: true,
          activo: true,
          webhookSecret: 'whsec_pse_transito_2026',
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener configuración de pasarela' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const configExistente = await prisma.configuracionPasarela.findFirst({
      where: { activo: true },
    });

    let configUpdated;
    if (configExistente) {
      configUpdated = await prisma.configuracionPasarela.update({
        where: { id: configExistente.id },
        data: {
          proveedor: body.proveedor || 'PSE',
          merchantId: body.merchantId,
          publicKey: body.publicKey,
          secretKey: body.secretKey,
          sandboxMode: body.sandboxMode ?? true,
          webhookSecret: body.webhookSecret,
        },
      });
    } else {
      configUpdated = await prisma.configuracionPasarela.create({
        data: {
          proveedor: body.proveedor || 'PSE',
          merchantId: body.merchantId,
          publicKey: body.publicKey,
          secretKey: body.secretKey,
          sandboxMode: body.sandboxMode ?? true,
          webhookSecret: body.webhookSecret,
        },
      });
    }

    return NextResponse.json(configUpdated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al guardar configuración de pasarela' }, { status: 500 });
  }
}
