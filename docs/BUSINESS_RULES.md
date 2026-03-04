# 📋 Reglas de Negocio

Este documento describe todas las reglas de negocio implementadas en el sistema Pipeline Workflow.

---

## 1. Alta de Cuentas (Formulario)

### 1.1 Campos Obligatorios (Siempre)

| Campo              | Nombre técnico      | Tipo     |
|--------------------|---------------------|----------|
| Cuenta             | `name`              | texto    |
| Ramo               | `ramo`              | combo    |
| Etapa              | `etapa`             | combo    |
| Prima Objetivo     | `primaObjetivo`     | numérico |
| Clave del Agente   | `claveAgente`       | texto    |
| Nearshoring        | `nearshoring`       | combo    |
| Prima Cotizada     | `primaCotizada`     | numérico |
| Observaciones      | `observaciones`     | texto    |

### 1.2 Campos Condicionales por Ramo

El campo **Ramo** determina qué campo adicional se muestra y es **obligatorio**:

| Ramo seleccionado   | Campo que aparece (obligatorio)  | Nombre técnico     |
|---------------------|----------------------------------|--------------------|
| **Autos**           | Giro de Negocio                  | `giroNegocio`      |
| **Daños**           | Subramo                          | `subramo`          |
| **Salud**           | Tipo de Experiencia              | `tipoExperiencia`  |
| **Vida**            | Tipo de Experiencia              | `tipoExperiencia`  |

> **Comportamiento**: Al cambiar el Ramo, los tres campos condicionales se limpian automáticamente. Solo se muestra el campo correspondiente al Ramo seleccionado; los demás permanecen ocultos.

### 1.3 Mutua Exclusión: Cuidado Integral ↔ Planmed

Estos dos campos son **mutuamente excluyentes**: no pueden coexistir simultáneamente.

| Condición                          | Efecto                                                  |
|------------------------------------|---------------------------------------------------------|
| Cuidado Integral = **Si**          | Planmed se deshabilita y se limpia                      |
| Cuenta con Planmed = **Si**        | Cuidado Integral se deshabilita y se limpia             |
| Uno seleccionado como **No** o vacío | El otro queda disponible                              |

### 1.4 Campos Condicionales: Cuidado Integral y Planmed

| Condición                         | Campo que aparece          | Nombre técnico   |
|-----------------------------------|----------------------------|------------------|
| Cuidado Integral = **Si**         | Plan (CI Salud / CI Plus)  | `plan`           |
| Cuenta con Planmed = **Si**       | Tipo de Planmed **(obligatorio)** | `tipoPlanMed`    |

> **Comportamiento**: Si se deselecciona el padre (ej: CI vuelve a vacío), el campo hijo se oculta y su valor se limpia.

### 1.5 Cuenta Existente (US-3)

Cuando se accede al formulario con una **cuenta ya existente** (`accountId` o `caseId` presente en la URL):

- El campo **Cuenta** (`name`) se muestra **prellenado y deshabilitado** (no editable).
- Los demás campos se cargan con los datos del caso más reciente asociado.
- Las mismas reglas de validación aplican.

### 1.6 Duplicado de Cuenta

Al crear una cuenta **nueva**, el sistema verifica que no exista otra cuenta con el mismo nombre.
Si existe, se muestra un error y no se permite guardar.

---

## 2. Negociación (Formulario)

### 2.1 Campos Heredados (Solo Lectura)

Los siguientes campos provienen de la etapa de Alta y no son editables en Negociación:

| Campo              | Origen      |
|--------------------|-------------|
| Cuenta             | Alta        |
| Ramo               | Alta        |
| Inicio Vigencia    | Alta        |
| Prima Objetivo     | Alta        |

### 2.2 Campos del Formulario de Negociación

| Campo                  | Nombre técnico         | Obligatorio          |
|------------------------|------------------------|----------------------|
| Observaciones          | `observaciones`        | ✅ **Único obligatorio** |
| Se quedó               | `seQuedo`              | No                   |
| Estatus                | `estatus`              | No                   |
| Prima Cotizada         | `primaCotizada`        | No                   |
| Población Asegurada    | `poblacionAsegurada`   | No                   |
| Motivo de No Ganado    | `motivoNoGanado`       | No                   |
| Aseguradora Ganadora   | `aseguradoraGanadora`  | No                   |

> **Nota (US-4)**: El único campo obligatorio a capturar en la pantalla de Negociación son las Observaciones. Los demás campos son opcionales.

### 2.3 Campos de Pérdida (informativos)

Cuando el estatus es **"No Ganada"**, se muestran los campos de pérdida (opcionales):

| Condición                    | Campos visibles                              |
|------------------------------|----------------------------------------------|
| Estatus = **No Ganada**      | Motivo de No Ganado, Aseguradora Ganadora    |
| Estatus ≠ **No Ganada**      | Estos campos se ocultan                      |

---

## 3. Emisión (Formulario)

### 3.1 Campos Heredados (Solo Lectura)

Los siguientes campos provienen de la etapa de Alta y no son editables en Emisión:

| Campo              | Origen      |
|--------------------|-------------|
| Cuenta             | Alta        |
| Ramo               | Alta        |
| Inicio Vigencia    | Alta        |
| Prima Objetivo     | Alta        |

### 3.2 Campos del Formulario de Emisión

| Campo                  | Nombre técnico         | Obligatorio          |
|------------------------|------------------------|----------------------|
| Observaciones          | `observaciones`        | ✅ **Único obligatorio** |
| Fecha Ingreso Folio    | `fechaIngresoFolio`    | No                   |
| Fecha Emisión          | `fechaEmision`         | No                   |
| Número de Pólizas      | `numPolizas`           | No                   |
| Póliza                 | `poliza`               | No                   |
| Población Emitida      | `poblacionEmitida`     | No                   |

> **Nota (US-6)**: El único campo obligatorio a capturar en la pantalla de Emisión son las Observaciones. Los demás campos son opcionales.

### 3.3 Finalización del Caso

Al presionar el botón **Finalizar** (✓), el sistema:
1. Valida que Observaciones esté completado.
2. Envía los datos con `finish: true` al endpoint `PUT /emission/:id`.
3. Cambia el estado del caso a **TERMINADO**.
4. Redirige al listado de cuentas.

---

## 4. Catálogos (Configuración)

### 4.1 Estructura Clave-Valor

Todos los catálogos (combos/dropdowns) se gestionan como pares **clave-valor**:

- **Clave**: Identificador que puede mapear a un ID externo de otra base de datos/tabla.
- **Valor**: Texto que se muestra en el combo del formulario.

> Las claves deben ser **únicas dentro de cada catálogo**. El sistema valida esto en el frontend antes de guardar.

### 4.2 Catálogos Disponibles

| Nombre técnico             | Etiqueta en UI                     | Usado en          |
|----------------------------|------------------------------------|--------------------|
| `ramo`                     | Ramo                               | Alta               |
| `subramo`                  | Subramo (Daños)                    | Alta (si Ramo=Daños) |
| `giroNegocio`              | Giro de Negocio (Autos)            | Alta (si Ramo=Autos) |
| `tipoExperiencia`          | Tipo de Experiencia (Salud/Vida)   | Alta (si Ramo=Salud/Vida) |
| `cuidaIntegral`            | Cuidado Integral                   | Alta               |
| `plan`                     | Plan                               | Alta (si CI=Si)    |
| `tipoPlanMed`              | Tipo de Planmed                    | Alta (si Planmed=Si) |
| `etapa`                    | Etapa                              | Alta               |
| `seQuedo`                  | ¿Se quedó?                         | Negociación        |
| `estatus`                  | Estatus                            | Negociación        |
| `motivoNoGanado`           | Motivo de No Ganado                | Negociación        |
| `responsableSuscripcion`   | Responsable de Suscripción         | Alta               |
| `aseguradoraGanadora`      | Aseguradora Ganadora               | Negociación        |

### 4.3 API de Catálogos

| Método   | Endpoint              | Descripción                              |
|----------|-----------------------|------------------------------------------|
| `GET`    | `/catalogs`           | Obtener todos los catálogos              |
| `GET`    | `/catalogs/:name`     | Obtener un catálogo por nombre           |
| `PUT`    | `/catalogs/:name`     | Actualizar valores de un catálogo        |
| `DELETE` | `/catalogs/:name`     | Eliminar un catálogo                     |

**Body del PUT:**
```json
{
  "entries": [
    { "key": "1", "value": "Autos" },
    { "key": "2", "value": "Daños" }
  ]
}
```

### 4.4 Persistencia

> ⚠️ **Estado actual**: Los catálogos se almacenan **en memoria**. Un reinicio del servidor restaura los valores por defecto. Está pendiente la persistencia en base de datos.

---

## 5. Bandeja de Seguimiento (US-5)

### 5.1 Funcionalidad

Pantalla que muestra **todos los casos activos** del sistema (etapas: Alta, Negociación, Emisión).

### 5.2 Búsqueda

- El buscador requiere un **mínimo de 3 caracteres** para filtrar.
- Busca por: folio, cuenta, ramo o estado.
- Se muestra un mensaje de ayuda cuando el usuario ingresa menos de 3 caracteres.

### 5.3 Navegación

Al hacer clic en una fila, el sistema navega al formulario correspondiente según la etapa:

| Etapa        | Destino                                |
|--------------|----------------------------------------|
| ALTA         | `/accounts/new?id=...&caseId=...`      |
| NEGOCIACION  | `/negotiation/:id`                      |
| EMISION      | `/emission/:id`                         |

### 5.4 Ficha de Caso

- Cada fila incluye un botón **"Ficha"** (icono 👁).
- El botón abre un **slide-over lateral** con un resumen del caso:
  - Header: folio, nombre de cuenta, tags (ramo, etapa, estado).
  - KPIs: prima objetivo, prima cotizada, inicio vigencia, etapa.
  - Datos del caso: agente, promotor, giro, nearshoring, planmed, etc.
  - Observaciones.
  - Sección Negociación (si existen datos).
  - Sección Emisión (si existen datos).

---

## 6. Bandeja de Renovaciones (US-7)

### 6.1 Funcionalidad

Pantalla que muestra las **cuentas que fueron emitidas** y están disponibles para renovación.

### 6.2 Ficha de Caso

- Cada fila incluye un botón **"Ficha"** (icono 👁).
- El botón abre un **slide-over lateral** con el resumen del caso (mismo formato que Seguimiento, sección 5.4).

---

## 7. Bandeja de Casos No Emitidos (US-8)

### 7.1 Funcionalidad

Pantalla que muestra los casos con estatus: **Cancelación, No Ganado, Rechazo de AXA**.

### 7.2 Ficha de Caso

- Cada fila incluye un botón **"Ficha"** (icono 👁).
- El botón abre un **slide-over lateral** con el resumen del caso (mismo formato que Seguimiento, sección 5.4).

---

## 8. Validación de Folio Duplicado (US-9)

### 8.1 Regla

Si ya existe un **caso activo** (status `ACTIVO`) para una **cuenta + ramo** determinados, **no se permite crear otro caso** con la misma combinación.

### 8.2 Implementación

- **Frontend (Tiempo Real)**: Al ingresar el nombre de la Cuenta y seleccionar un Ramo, el sistema verifica automáticamente en segundo plano si la cuenta existe y si ya tiene un caso activo en ese Ramo. Si existe un duplicado, se muestra una alerta visual (⚠️) inmediatamente debajo del campo Ramo.
- **Frontend (Guardado)**: Si el usuario ingresa una Cuenta que **ya existe**, pero selecciona un **Ramo diferente** (para el cual no hay caso activo), el sistema guarda la información creando un **nuevo Caso vinculado a la Cuenta existente**, evitando así la duplicidad de registros de cuentas en la base de datos.
- **Backend**: Endpoint `GET /cases/check-duplicate?accountId=...&ramo=...` verifica si existe caso abierto.
- **Backend**: Validación adicional en el método `create()` del servicio de casos.

### 8.3 Mensaje al usuario

> ⚠️ Ya existe un caso abierto para la cuenta "Cemex" con ramo "Vida". No se puede crear otro.

---

## 9. Reportería / Consulta de Folios (US-12)

### 9.1 Funcionalidad

Pantalla de reportes con dos pestañas:

| Pestaña             | Contenido                                        |
|---------------------|--------------------------------------------------|
| **Resumen**         | 4 tarjetas KPI (Cuentas, Producción, Ramo, Agentes) |
| **Consulta de Folios** | Tabla completa de **todos los casos** del sistema  |

### 9.2 Consulta de Folios

- Tabla con columnas: Folio, Cuenta, Ramo, Etapa, Estado, Prima Obj., Prima Cot., Última modif., Ficha.
- **Búsqueda** libre por folio, cuenta, ramo o estado.
- **Exportar Excel**: descarga todos los registros filtrados.
- **Botón Ficha**: abre slide-over con resumen del caso (sección 5.4).

### 9.3 Acceso

- Rol: Administrador (actualmente accesible para todos los usuarios autenticados).

---

## 10. Workflow — Flujo de Estados

### 10.1 Pasos del Workflow

```
ALTA → NEGOCIACIÓN → EMISIÓN → TERMINADO
```

### 10.2 Estados del Caso

| Estado       | Descripción                                      |
|--------------|--------------------------------------------------|
| `ACTIVO`     | Caso en proceso                                  |
| `CANCELADO`  | Cancelado por el usuario o el sistema             |
| `RECHAZADO`  | Rechazado por AXA                                |
| `TERMINADO`  | Caso finalizado exitosamente                     |

### 10.3 Renovación de Casos

Un caso puede ser renovado desde la etapa de emisión o terminado:
- Se crea un **nuevo caso** vinculado al original (`parentCaseId`).
- Los datos de la cuenta se copian del caso padre.
- La etapa se reinicia a **"Creado"**.
- El campo de observaciones incluye referencia al folio del caso padre.

