/**
 * seed_v2.ts
 * ------------
 * Inyecta datos de demo completos y consistentes para presentaciones,
 * cumpliendo estrictamente la regla de "No duplicar Ramo activo en la misma Cuenta",
 * y las reglas de obligatoriedad de Datos de Pérdida en Negociación.
 * 
 * Ejecutar: npx ts-node prisma/seed_v2.ts
 */

import { PrismaClient, WorkflowStep } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────
// Valores de combos
// ──────────────────────────────────────────────
const RAMOS = ['Autos', 'Daños', 'Salud', 'Vida'] as const;
const SUBRAMOS = [
  'Múltiple Empresarial (MEM)', 'L. Com Transportes', 'L. Com Responsabilidad Civil',
  'Property', 'Financieras & Cyber', 'Otro'
];
const TIPOS_EXP = ['Propia', 'Global'];
const PLANES = ['Cuidado Integral Salud', 'Cuidado Integral Plus'];
const CONDUCTORES = ['Si', 'No'];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ──────────────────────────────────────────────
// Cuentas demo base
// ──────────────────────────────────────────────
const ACCOUNTS = [
  { id: 'acc-001', name: 'Grupo Bimbo', identifier: 'BIMBO-001', industry: 'Alimentos', ramo: 'Salud', subramo: 'Múltiple Empresarial (MEM)', primaObjetivo: 5_000_000, vigencia: '2026-01-01' },
  { id: 'acc-002', name: 'Cemex', identifier: 'CEMEX-002', industry: 'Construcción', ramo: 'Daños', subramo: 'Property', primaObjetivo: 12_000_000, vigencia: '2026-02-01' },
  { id: 'acc-003', name: 'America Movil', identifier: 'AMOVIL-003', industry: 'Telecomunicaciones', ramo: 'Vida', subramo: 'Otro', primaObjetivo: 8_500_000, vigencia: '2026-03-01' },
  { id: 'acc-004', name: 'Fomento Económico Mexicano', identifier: 'FEMSA-004', industry: 'Bebidas', ramo: 'Autos', subramo: 'L. Com Transportes', primaObjetivo: 3_200_000, vigencia: '2026-01-15' },
  { id: 'acc-005', name: 'Grupo México', identifier: 'GMEX-005', industry: 'Minería', ramo: 'Daños', subramo: 'L. Com Responsabilidad Civil', primaObjetivo: 15_000_000, vigencia: '2026-04-01' },
  { id: 'acc-006', name: 'Banorte', identifier: 'BANORTE-006', industry: 'Finanzas', ramo: 'Vida', subramo: 'Financieras & Cyber', primaObjetivo: 2_000_000, vigencia: '2026-05-01' },
  { id: 'acc-007', name: 'Walmart de México', identifier: 'WALMEX-007', industry: 'Retail', ramo: 'Salud', subramo: 'Múltiple Empresarial (MEM)', primaObjetivo: 9_000_000, vigencia: '2026-01-01' },
  { id: 'acc-008', name: 'Grupo Elektra', identifier: 'ELEKTRA-008', industry: 'Retail', ramo: 'Daños', subramo: 'Otro', primaObjetivo: 4_500_000, vigencia: '2026-06-01' },
  { id: 'acc-009', name: 'Alfa', identifier: 'ALFA-009', industry: 'Diversificado', ramo: 'Autos', subramo: 'Otro', primaObjetivo: 1_800_000, vigencia: '2026-02-15' },
  { id: 'acc-010', name: 'El Puerto de Liverpool', identifier: 'LIVERPOOL-010', industry: 'Retail', ramo: 'Vida', subramo: 'Otro', primaObjetivo: 6_700_000, vigencia: '2026-03-15' },
];

function makeCaseData(acc: typeof ACCOUNTS[number]) {
  return {
    giroNegocio: acc.industry,
    tipoExperiencia: pick(TIPOS_EXP),
    fechaInicioVigencia: acc.vigencia,
    primaObjetivo: String(acc.primaObjetivo),
    cuidadoIntegral: 'Si',
    plan: pick(PLANES),
    claveAgente: '26601',
    nombreAgente: 'JUAN PEREZ',
    promotor: 'PROMOTORIA NORTE',
    territorio: 'NORTE',
    oficina: 'MONTERREY',
    canal: 'AGENTE',
    centroCostos: 'CC-001',
    nuevoConducto: pick(CONDUCTORES),
    nearshoring: pick(CONDUCTORES),
    poblacion: String(Math.floor(Math.random() * 900) + 100),
    incisos: String(Math.floor(Math.random() * 5) + 1),
    ubicaciones: String(Math.floor(Math.random() * 10) + 1),
    tipo: 'Renovación',
    subtipo: 'Normal',
    observaciones: `Cuenta ${acc.name}. Primera renovación ${new Date().getFullYear()}. Contactar al broker principal para negociar rate.`,
  };
}

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.error('❌  No users found. Please register a user first.');
    process.exit(1);
  }

  // --- 1. LIMPIEZA TOTAL ---
  console.log('🧹 Limpiando base de datos (Cases y Accounts)...');
  await prisma.emissionData.deleteMany();
  await prisma.negotiationData.deleteMany();
  await prisma.case.deleteMany();
  await prisma.account.deleteMany();
  console.log('🧹 Limpieza completada.');

  for (const user of users) {
    console.log(`\n✅  Seeding as user: ${user.email} (${user.id})`);

    // Short string to make IDs unique per user
    const uSuffix = user.id.split('-')[0];

    // --- 2. CREACIÓN DE ACCOUNTS PARA EL USUARIO ---
    for (const acc of ACCOUNTS) {
      await prisma.account.create({
        data: {
          id: `${acc.id}-${uSuffix}`,
          name: acc.name,
          identifier: `${acc.identifier}-${uSuffix}`,
          industry: acc.industry,
          ramo: acc.ramo,
          subramo: acc.subramo,
          primaObjetivo: acc.primaObjetivo,
          fechaInicioVigencia: new Date(acc.vigencia),
          createdBy: user.id,
        }
      });
    }

    // --- 3. CREACIÓN DE CASOS PARA EL USUARIO ---
    const acc1Id = `${ACCOUNTS[0].id}-${uSuffix}`;
    const acc2Id = `${ACCOUNTS[1].id}-${uSuffix}`;
    const acc3Id = `${ACCOUNTS[2].id}-${uSuffix}`;
    const acc4Id = `${ACCOUNTS[3].id}-${uSuffix}`;
    const acc5Id = `${ACCOUNTS[4].id}-${uSuffix}`;
    const acc6Id = `${ACCOUNTS[5].id}-${uSuffix}`;

    const acc1 = ACCOUNTS[0];
    await prisma.case.create({
      data: {
        refnum: `DEMO-001A-${uSuffix}`, accountId: acc1Id, workflowStep: 'ALTA', status: 'ACTIVO',
        assignedTo: user.id, ramo: acc1.ramo, data: makeCaseData(acc1)
      }
    });

    const acc2 = ACCOUNTS[1];
    const caseData2_A = makeCaseData(acc2);
    await prisma.case.create({
      data: {
        refnum: `DEMO-002A-${uSuffix}`, accountId: acc2Id, workflowStep: 'EMISION', status: 'ACTIVO',
        assignedTo: user.id, ramo: acc2.ramo, data: caseData2_A,
        negotiationData: {
          create: {
            estatus: 'Ganada', seQuedo: true, poblacionAsegurada: parseInt(caseData2_A.poblacion),
            primaAsegurados: acc2.primaObjetivo * 0.9, cuidadoIntegralPoblacion: parseInt(caseData2_A.poblacion),
            cuidadoIntegralPrima: acc2.primaObjetivo * 0.1, observaciones: `[Heredado de Alta] ${caseData2_A.observaciones}`
          }
        }
      }
    });

    const caseData2_B = makeCaseData(acc2);
    await prisma.case.create({
      data: {
        refnum: `DEMO-002B-${uSuffix}`, accountId: acc2Id, workflowStep: 'ALTA', status: 'ACTIVO',
        assignedTo: user.id, ramo: 'Autos', data: { ...caseData2_B, observaciones: 'Nueva cotización flotilla CEMEX.' }
      }
    });

    const acc3 = ACCOUNTS[2];
    const caseData3_A = makeCaseData({ ...acc3, vigencia: '2025-01-01' });
    await prisma.case.create({
      data: {
        refnum: `DEMO-003A-HIST-${uSuffix}`, accountId: acc3Id, workflowStep: 'ALTA', status: 'CANCELADO',
        assignedTo: user.id, ramo: acc3.ramo, data: caseData3_A
      }
    });

    const caseData3_B = makeCaseData(acc3);
    await prisma.case.create({
      data: {
        refnum: `DEMO-003B-${uSuffix}`, accountId: acc3Id, workflowStep: 'NEGOCIACION', status: 'ACTIVO',
        assignedTo: user.id, ramo: acc3.ramo, data: caseData3_B,
        negotiationData: {
          create: {
            estatus: 'En Proceso', seQuedo: true, poblacionAsegurada: parseInt(caseData3_B.poblacion),
            primaAsegurados: acc3.primaObjetivo * 0.85, cuidadoIntegralPoblacion: parseInt(caseData3_B.poblacion),
            cuidadoIntegralPrima: acc3.primaObjetivo * 0.15, observaciones: `[Heredado de Alta] ${caseData3_B.observaciones}`
          }
        }
      }
    });

    const acc4 = ACCOUNTS[3];
    const caseData4 = makeCaseData(acc4);
    await prisma.case.create({
      data: {
        refnum: `DEMO-004A-${uSuffix}`, accountId: acc4Id, workflowStep: 'NEGOCIACION', status: 'ACTIVO',
        assignedTo: user.id, ramo: acc4.ramo, data: caseData4,
        negotiationData: {
          create: {
            estatus: 'Rechazo de AXA', seQuedo: false,
            poblacionAsegurada: parseInt(caseData4.poblacion), primaAsegurados: acc4.primaObjetivo,
            observaciones: `AXA declinó el riesgo. Mover a cancelados o archivados pronto.`
          }
        }
      }
    });

    const acc5 = ACCOUNTS[4];
    const caseData5 = makeCaseData(acc5);
    await prisma.case.create({
      data: {
        refnum: `DEMO-005A-${uSuffix}`, accountId: acc5Id, workflowStep: 'NEGOCIACION', status: 'ACTIVO',
        assignedTo: user.id, ramo: acc5.ramo, data: caseData5,
        negotiationData: {
          create: {
            estatus: 'No Ganada', seQuedo: false,
            poblacionAsegurada: parseInt(caseData5.poblacion), primaAsegurados: acc5.primaObjetivo,
            motivoNoGanado: 'Diferencia en Prima', aseguradoraGanadora: 'MetLife', primaCompetencia: acc5.primaObjetivo * 0.7,
            observaciones: `Perdimos contra MetLife por factor precio. El cliente no justificó el 30% extra.`
          }
        }
      }
    });

    const acc6 = ACCOUNTS[5];
    const caseData6 = makeCaseData(acc6);
    await prisma.case.create({
      data: {
        refnum: `DEMO-006A-${uSuffix}`, accountId: acc6Id, workflowStep: 'TERMINADO', status: 'TERMINADO',
        assignedTo: user.id, ramo: acc6.ramo, data: caseData6,
        negotiationData: {
          create: {
            estatus: 'Ganada', seQuedo: true, poblacionAsegurada: parseInt(caseData6.poblacion), primaAsegurados: acc6.primaObjetivo,
            cuidadoIntegralPoblacion: parseInt(caseData6.poblacion), cuidadoIntegralPrima: 1000, observaciones: caseData6.observaciones
          }
        },
        emissionData: {
          create: {
            fechaIngresoFolio: new Date(acc6.vigencia), fechaEmision: new Date(acc6.vigencia),
            numPolizas: parseInt(caseData6.incisos), poliza: `POL-006A-${uSuffix}`,
            observaciones: `Pólizas entregadas a RRHH Banorte.`
          }
        }
      }
    });
  }

  console.log('\n🎉  Demo seed V2 - Reglas estrictas - Finalizado exitosamente.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
