import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '@/infrastructure/security/jwt';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de entrada no válidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Demo/Initial Mock fallback user authentication until database is seeded
    let mockUser = {
      id: 'usr-admin-001',
      email: 'admin@transito.gov.co',
      nombre: 'Administrador de Tránsito',
      rol: 'ADMIN',
      passwordHash: '',
    };

    let isValidPassword = false;
    if (email === 'admin@transito.gov.co' && (password === 'admin123' || password === 'admin123456')) {
      isValidPassword = true;
    } else if (email === 'funcionario@transito.gov.co' && (password === 'func123' || password === 'func123456')) {
      mockUser = {
        id: 'usr-func-002',
        email: 'funcionario@transito.gov.co',
        nombre: 'Agente Carlos Pérez',
        rol: 'FUNCIONARIO',
        passwordHash: '',
      };
      isValidPassword = true;
    } else if (email === 'ciudadano@gmail.com' && (password === 'ciud123' || password === 'ciud123456')) {
      mockUser = {
        id: 'usr-ciud-003',
        email: 'ciudadano@gmail.com',
        nombre: 'Juan Rodríguez',
        rol: 'CIUDADANO',
        passwordHash: '',
      };
      isValidPassword = true;
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: mockUser.id,
      email: mockUser.email,
      rol: mockUser.rol,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    const response = NextResponse.json({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        nombre: mockUser.nombre,
        rol: mockUser.rol,
      },
      accessToken,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno en el servidor de autenticación', details: error?.message },
      { status: 500 }
    );
  }
}
