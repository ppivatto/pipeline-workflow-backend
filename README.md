# 📟 Backend Service (NestJS)

Servicio principal de API encargado de la persistencia y lógica de negocio.

## 📖 Documentación General

Para acceder a la documentación técnica y de arquitectura, consulte los archivos en la carpeta `docs/`:

- **[📄 Arquitectura y Diseño del Sistema](./docs/ARCHITECTURE.md)**
- **[🤖 Guía para IAs y Agentes](./docs/AGENTS.md)**
- **[🗄 Estructura de Base de Datos](./docs/DATABASE_SCHEMA.md)**
- **[📊 Especificación de Datos de Prueba](./docs/SEED_DATA_SPEC.md)**
- **[🚀 Guía de Instalación y Setup](./docs/SETUP.md)**

## 🚀 Instalación y Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno:
   Copiar `.env.example` a `.env` y configurar `DATABASE_URL`.
3. Generar cliente Prisma:
   ```bash
   npx prisma generate
   ```
4. Iniciar en modo desarrollo:
   ```bash
   npm run start:dev
   ```

## 🧪 Scripts Útiles

| Script | Descripción |
|---|---|
| `npx ts-node prisma/seed_demo.ts` | Popula la base de datos con 10 cuentas y 50 casos de prueba realistas. |
| `npx ts-node prisma/patch_case_data.ts` | Repara registros antiguos que tienen el campo JSON `data` incompleto. |

## 🏗 Estructura de Módulos

- `src/auth`: Manejo de JWT y protección de rutas.
- `src/accounts`: Gestión de cuentas de seguros.
- `src/cases`: Lógica central del workflow y gestión de la columna JSON.
- `src/negotiation`: Gestión de datos específicos de la etapa de Negociación.
- `src/emission`: Gestión de datos específicos de la etapa de Emisión.
- `src/prisma`: Servicio generador del cliente de base de datos.
