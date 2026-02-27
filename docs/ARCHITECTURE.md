# 🏛 Arquitectura del Sistema

Este documento describe la arquitectura técnica y funcional del sistema Pipeline Workflow.

## 🔄 Flujo de Trabajo (Workflow)

El sistema gestiona "Cuentas" y sus respectivos "Casos". Cada caso sigue un flujo lineal definido por el enum `WorkflowStep`:

1.  **ALTA**: Captura inicial de datos de la cuenta y el producto.
2.  **NEGOCIACIÓN**: Proceso de oferta y competencia.
3.  **EMISIÓN**: Etapa final de generación de pólizas.
4.  **TERMINADO**: Caso finalizado (Ganado).

## 📊 Modelo de Datos (Prisma)

El esquema de base de datos (`prisma/schema.prisma`) utiliza tres tablas principales para el workflow:

- `Account`: Datos maestros del cliente.
- `Case`: La entidad central. Utiliza una columna JSON `data` para almacenar la flexibilidad del formulario de Alta sin requerir migraciones constantes.
- `NegotiationData` / `EmissionData`: Tablas relacionadas 1:1 con `Case` para almacenar datos específicos de etapas avanzadas, garantizando integridad referencial en campos críticos.

### Patrón de Persistencia JSON
El formulario de **Alta de Cuentas** guarda casi todos sus campos en el campo `data` del modelo `Case`. 
- **Ventaja**: Permite añadir campos dinámicos al formulario sin tocar el esquema de BD.
- **Implementación**: El backend aplana este JSON cuando devuelve un caso (`findOne`), facilitando su uso en el frontend.

## 🔐 Seguridad y Autenticación

- **Backend**: Implementa `Passport.js` con estrategia `JWT`. Los endpoints están protegidos por el decorador `@UseGuards(JwtAuthGuard)`.
- **Frontend**: Utiliza un `AuthContext` para manejar el token de sesión y una ruta protegida `PrivateRoute`.

## 📡 Comunicación API

- Se utiliza **Axios** con un cliente configurado (`frontend/src/api/client.ts`) que intercepta las peticiones para adjuntar el JWT.
- La gestión de estado asíncrono y caché se realiza mediante **TanStack Query** (React Query).

## 🚀 Scripts de Mantenimiento

Existen scripts especializados en `backend/prisma/` para tareas de soporte:
- `seed_demo.ts`: Genera datos realistas para demostraciones.
- `patch_case_data.ts`: Repara inconsistencias en la columna JSON `data` de registros antiguos.
