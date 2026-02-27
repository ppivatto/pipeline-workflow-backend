# 🚀 Pipeline Workflow CI - Enterprise Dashboard

Este repositorio contiene una solución integral para la gestión de flujos de trabajo de cuentas y casos para el sector seguros. El sistema está diseñado siguiendo patrones de arquitectura empresarial, con un enfoque en escalabilidad, legibilidad y capacidad de integración mediante IA.

## 🏗 Arquitectura General

El proyecto se divide en dos grandes bloques:

- **Backend**: Basado en **NestJS** con **Prisma ORM**. Maneja la lógica de negocio, persistencia en base de datos relacional y autenticación JWT.
- **Frontend**: Single Page Application (SPA) desarrollada con **React 19**, **Vite** y **TanStack Query**. Implementa un sistema de diseño "Glassmorphism" premium y responsivo.

## 📦 Estructura del Proyecto

```text
.
├── backend/            # Lógica de servidor, API REST y Base de Datos
└── frontend/           # Interfaz de usuario y lógica de cliente
```

## 🛠 Requisitos Previos

- **Node.js**: v18 o superior
- **Docker**: (Opcional, para base de datos local)
- **Supabase/PostgreSQL**: Instancia de base de datos configurada

## 🚀 Inicio Rápido

1. **Backend**:
   ```bash
   cd backend
   npm install
   # Configurar .env (ver backend/README.md)
   npx prisma generate
   npm run start:dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📖 Documentación Detallada

Para guías específicas, consulta los archivos de documentación dedicados:

- [📄 Arquitectura y Diseño del Sistema](./ARCHITECTURE.md)
- [🤖 Guía para IAs y Agentes](./AGENTS.md)
- [🖥 Documentación Backend](./backend/README.md)
- [🎨 Documentación Frontend](./frontend/README.md)

---
*Desarrollado con estándares de alta calidad para entornos Enterprise.*
