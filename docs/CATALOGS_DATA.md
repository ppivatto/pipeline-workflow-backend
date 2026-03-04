# 📦 Catálogos — Datos de Referencia

Este documento lista los valores iniciales (por defecto) de cada catálogo del sistema.
Los catálogos se gestionan desde la UI en `/catalogos` y son editables en caliente.

---

## Ramo
| Clave | Valor |
|-------|-------|
| 1     | Autos |
| 2     | Daños |
| 3     | Salud |
| 4     | Vida  |

## Subramo (aplica si Ramo = Daños)
| Clave | Valor |
|-------|-------|
| 1     | Múltiple Empresarial (MEM) |
| 2     | L. Com Transportes |
| 3     | L. Com Responsabilidad Civil |
| 4     | L. Com Ramos Técnicos |
| 5     | L. Est. Transportes |
| 6     | L. Est. Responsabilidad Civil |
| 7     | L. Est Ramos Técnicos |
| 8     | Obras de Arte |
| 9     | Aviación |
| 10    | Financieras & Cyber |
| 11    | Property |
| 12    | Parámetro |
| 13    | Otro |

## Giro de Negocio (aplica si Ramo = Autos)
| Clave | Valor |
|-------|-------|
| 1     | Flotillas utilitarias |
| 2     | Flotillas de empleados |
| 3     | Flotillas transportistas de carga propia (carga A y B) |
| 4     | Plan Piso y Traslado |
| 5     | Flotillas Transportistas Carga Propia (carga C y D) |
| 6     | Flotillas Transportistas Carga Terceros (carga A y B) |
| 7     | Flotillas transportistas de carga terceros (carga C y D) |
| 8     | Otro |

## Tipo de Experiencia (aplica si Ramo = Salud o Vida)
| Clave | Valor |
|-------|-------|
| 1     | Propia |
| 2     | Global |

## Cuidado Integral
| Clave | Valor |
|-------|-------|
| 1     | Si |
| 2     | No |

## Plan (aplica si Cuidado Integral = Si)
| Clave | Valor |
|-------|-------|
| 1     | Cuidado Integral Salud |
| 2     | Cuidado Integral Plus |

## Tipo de Planmed (aplica si Cuenta con Planmed = Si)
| Clave | Valor |
|-------|-------|
| 1     | Planmed Hibrido |
| 2     | Planmed Estandar |
| 3     | Planmed Esencial |
| 4     | Planmed Optimo |

## Etapa
| Clave | Valor |
|-------|-------|
| 1     | Creado |
| 2     | Prospección |
| 3     | Propuesta Entregada |
| 4     | Emisión |
| 5     | Cierre |

## ¿Se quedó?
| Clave | Valor |
|-------|-------|
| 1     | Si |
| 2     | No |
| 3     | En etapa de negociación |

## Estatus
| Clave | Valor |
|-------|-------|
| 1     | Ganado |
| 2     | En proceso de emisión |
| 3     | Cancelación |
| 4     | No Ganada |
| 5     | Rechazo de AXA |

## Motivo de No Ganado
| Clave | Valor |
|-------|-------|
| 1     | Costo |
| 2     | Condiciones |
| 3     | Tiempo de cotización |
| 4     | Esquema de compensación |
| 5     | Fidelización |
| 6     | Oferta de Valor |
| 7     | Cuenta Cruzada |

## Aseguradora Ganadora
| Clave | Valor |
|-------|-------|
| 1     | AXA Seguros |
| 2     | Afirme |
| 3     | Aig |
| 4     | Allianz |
| 5     | Ana Seguros |
| 6     | Argos |
| 7     | Aserta |
| 8     | Atlas |
| 9     | Banorte |
| 10    | Bbva |
| 11    | Bx+ |
| 12    | Chubb |
| 13    | General De Seguros |
| 14    | GNP |
| 15    | Hdi |
| 16    | Inbursa |
| 17    | Mapfre |
| 18    | Metlife |
| 19    | Monterrey Ney York Life |
| 20    | Otra |
| 21    | Prevem |
| 22    | Primero Seguros |
| 23    | Qualitas |
| 24    | Sisnova |
| 25    | Sura |
| 26    | Zurich |

## Responsable de Suscripción

> ⚠️ **132 registros** — Lista completa en el código fuente (`catalogs.service.ts`).

| Clave | Valor (primeros 20) |
|-------|---------------------|
| 1     | Octavio Coria Bernal |
| 2     | Adriana Suarez Lopez |
| 3     | Thelma Guarneros Angeles |
| 4     | Alan Lomeli Farelas |
| 5     | Ricardo Farrera Herrera |
| 6     | Francisco Mancera Gomez |
| 7     | Jorge Eduardo Najera |
| 8     | Jesus Alejandro De la Rosa |
| 9     | Iris Perez Sosa |
| 10    | Jennifer Hernandez Ugalde |
| 11    | Roberto Gonzalez |
| 12    | Ruth Aviña Noriega |
| 13    | Marcos Diaz de Leon |
| 14    | Francisco Gutierrez |
| 15    | Cesilia Irabien |
| 16    | Maria Gpe. Martinez |
| 17    | Hugo Salas Lopez |
| 18    | Pedro Cabrera |
| 19    | Ricardo Martinez Mendieta |
| 20    | Israel Miranda |
| ...   | *(132 registros en total)* |
