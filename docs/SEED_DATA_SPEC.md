# 📊 Especificación de Datos de Prueba (Seeds)

Este documento detalla la lógica de generación y el contenido de los datos de prueba (`Seeds`) que pueblan el sistema para demostraciones (POC).

## 🚀 Fuente de Datos
Los datos se inyectan a través del script:
`backend/prisma/seed_demo.ts`

## 📂 Datos Maestros (Cuentas)
El sistema carga **10 cuentas iniciales** que representan el mercado mexicano de seguros empresariales:

| Cuenta | Identificador | Giro / Industria |
|---|---|---|
| **Grupo Bimbo** | `BIMBO-001` | Alimentos |
| **Cemex** | `CEMEX-002` | Construcción |
| **America Movil** | `AMOVIL-003` | Telecomunicaciones |
| **FEMSA** | `FEMSA-004` | Bebidas |
| **Grupo México** | `GMEX-005` | Minería |
| **Banorte** | `BANORTE-006` | Finanzas |
| **Walmart de México** | `WALMEX-007` | Retail |
| **Grupo Elektra** | `ELEKTRA-008` | Retail |
| **Alfa** | `ALFA-009` | Diversificado |
| **Liverpool** | `LIVERPOOL-010` | Retail |

## 🔄 Escenarios de Casos (Workflow)
Por cada cuenta se generan **5 escenarios de casos** con estados consistentes:

### 📑 Escenario 1: Alta (Nuevo)
- **Refnum**: `DEMO-XXX-01`
- **Etapa**: `ALTA`
- **Estado**: `ACTIVO`
- **Datos**: Solo cargados los datos iniciales del formulario de Alta.

### 💼 Escenario 2: Negociación (En Proceso)
- **Refnum**: `DEMO-XXX-02`
- **Etapa**: `NEGOCIACION`
- **Estado**: `ACTIVO`
- **Datos**: Incluye datos de población asegurada y prima de negociación.

### 📄 Escenario 3: Emisión (Captura Final)
- **Refnum**: `DEMO-XXX-03`
- **Etapa**: `EMISION`
- **Estado**: `ACTIVO`
- **Datos**: Incluye número de póliza, fecha de emisión y observaciones finales.

### 🏆 Escenario 4: Terminado (Ganado)
- **Refnum**: `DEMO-XXX-04`
- **Etapa**: `TERMINADO` (Step final)
- **Estado**: `TERMINADO`
- **Datos**: Registro completo del ciclo de vida del caso.

### ❌ Escenario 5: Cancelado (Rechazo)
- **Refnum**: `DEMO-XXX-05`
- **Etapa**: `ALTA`
- **Estado**: `CANCELADO`
- **Datos**: Caso descartado en la etapa inicial.

## 🛠 Atributos Fijos (Mock de Agente)
Casi todos los casos generados usan estos datos por ser los que utiliza el broker de prueba:
- **Clave Agente**: `26601`
- **Nombre**: `JUAN PEREZ`
- **Promotor**: `PROMOTORIA NORTE`
- **Territorio**: `NORTE`
- **Oficina**: `MONTERREY`

## 🧪 Ejecutar Seeds
Para resetear la base de datos con esta estructura, ejecuta:
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed_demo.ts
```
*Si deseas parchar datos inconsistentes sin borrar, usa `prisma/patch_case_data.ts`.*
