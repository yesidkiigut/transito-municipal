# 🚦 Sistema de Tránsito Municipal

Sistema integral de gestión de trámites de tránsito a nivel municipal desarrollado bajo **Arquitectura Hexagonal (Ports & Adapters)**.

## 🏗️ Arquitectura y Tecnologías

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, Zustand, React Router v6, Lucide Icons, Sonner.
- **Backend**: Next.js 14+ (App Router, API Routes), TypeScript, Prisma ORM, Zod, JWT (jose), Bcrypt.
- **Base de Datos & Caché**: PostgreSQL 16, Redis 7.
- **Infraestructura**: Docker & Docker Compose, Nginx Reverse Proxy.

## 📦 Estructura del Monorepo

```
transito-municipal/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/            # Next.js API Routes + Hexagonal Layering
│   ├── src/domain/     # Entidades, Value Objects, Puertos, Excepciones
│   ├── src/application/# Casos de Uso, DTOs, Mappers, Servicios
│   ├── src/infrastructure/# Repositorios Prisma, Security, Controllers
│   └── prisma/         # Schema, Migraciones y Seed
├── frontend/           # SPA React + Vite + Tailwind CSS + Zustand
│   └── src/
│       ├── features/   # Módulos por Bounded Context
│       ├── store/      # Zustand Stores
│       └── shared/     # Componentes visuales y utilidades
└── infra/              # Nginx y scripts de despliegue
```

## 🚀 Instalación y Arranque Rápido

1. Clonar el repositorio y copiar las variables de entorno:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Ejecutar mediante Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. Accesos:
   - **Frontend (Nginx / Directo):** http://localhost (o http://localhost:3000)
   - **Backend API:** http://localhost:3001/api/v1/health
