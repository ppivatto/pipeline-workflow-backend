# 🤖 AI / Agent Context & Guidelines

Este archivo proporciona contexto esencial para que asistentes de IA (como Antigravity, GitHub Copilot, etc.) entiendan rápidamente las particularidades del proyecto y cómo contribuir correctamente.

## 🧠 Contexto de Negocio

Este es un CRM/Workflow para brokers de seguros. El lenguaje predominante en la UI es **Español (México)**.

## 🛠 Directrices Técnicas para IAs

### 1. Manejo del Formulario de Alta
El componente `NewAccount.tsx` es el más complejo. 
- **Regla de Oro**: Si añades un campo al formulario de Alta, asegúrate de que el backend no necesite una migración. Los datos "extra" deben guardarse en el objeto JSON `data`.
- **Carga de Datos**: Al recuperar un caso para edición, el backend ya habrá mezclado los campos de `data` en la raíz del objeto.

### 2. Formato de Fechas
- Los inputs de tipo `date` en HTML esperan el formato `YYYY-MM-DD`. 
- El backend suele devolver strings ISO (`2026-02-27T10:00:00.000Z`).
- **Acción**: Siempre usa la función utilitaria `toDateStr` o `substring(0, 10)` al cargar fechas en los formularios para evitar que los campos aparezcan vacíos.

### 3. Evitar Duplicidad en Cuentas
- Existe un endpoint `GET /accounts/check-duplicate?name=...`. 
- Siempre verifica duplicados en el evento `onBlur` del campo de nombre en el formulario de Alta.

### 4. Estilo Visual (Enterprise Premium)
- El sistema utiliza una estética de **Glassmorphism**.
- Usa variables CSS (`var(--primary)`, `var(--border)`, `var(--text-muted)`) definidas en `index.css`.
- Los componentes deben sentirse "vivos" con efectos `:hover` y transiciones (`transition: all 0.2s`).

## 📁 Archivos Clave para Referencia

- `frontend/src/features/accounts/NewAccount.tsx`: Lógica principal del workflow inicial.
- `backend/prisma/schema.prisma`: Fuente de verdad del modelo de datos.
- `backend/prisma/seed_demo.ts`: Referencia de cómo deben ser los datos consistentes.
- `frontend/src/utils/exportToExcel.ts`: Utilidad para exportación nativa a CSV/Excel.

## ⚠️ Errores Comunes a Evitar

- **Carga de Cuentas**: Si navegas a "Alta" sin un `caseId` pero con un `accountId`, el sistema debe buscar proactivamente el caso activo más reciente para esa cuenta. Si no lo haces, el usuario verá un formulario vacío para una cuenta existente.
- **Tipado**: Asegúrate de convertir valores numéricos a `string` al cargarlos en inputs controlados de React para evitar warnings de `null` vs `input value`.
