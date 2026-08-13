import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { impuestoId, bancoCodigo, emailPagador } = await req.json();

    if (!impuestoId) {
      return NextResponse.json({ error: 'El ID del impuesto es obligatorio' }, { status: 400 });
    }

    const impuesto = await prisma.impuestoVehicular.findUnique({
      where: { id: impuestoId },
    });

    if (!impuesto) {
      return NextResponse.json({ error: 'Impuesto no encontrado' }, { status: 404 });
    }

    const pasarelaConfig = await prisma.configuracionPasarela.findFirst({
      where: { activo: true },
    });

    const refPago = `PSE-TRANSITO-${Date.now().toString().slice(-8)}`;

    // Actualizar estado del impuesto a PAGADO con la referencia de pago PSE
    const impuestoActualizado = await prisma.impuestoVehicular.update({
      where: { id: impuestoId },
      data: {
        estado: 'PAGADO',
        fechaPago: new Date(),
        reciboPagoRef: refPago,
      },
    });

    return NextResponse.json({
      mensaje: 'Transacción PSE procesada exitosamente',
      referenciaPago: refPago,
      proveedorPasarela: pasarelaConfig?.proveedor || 'PSE',
      modo: pasarelaConfig?.sandboxMode ? 'SANDBOX' : 'PRODUCCION',
      bancoSeleccionado: bancoCodigo || 'BANCO_COLOMBIA_PSE',
      emailPagador: emailPagador || 'pagador@ejemplo.com',
      valorPagado: impuestoActualizado.valorTotalPagar,
      fechaPago: impuestoActualizado.fechaPago?.toISOString(),
      urlComprobantePDF: `/api/v1/impuestos/comprobante/${refPago}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al iniciar pago PSE' }, { status: 500 });
  }
}
