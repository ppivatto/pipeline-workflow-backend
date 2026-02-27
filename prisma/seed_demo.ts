/**
 * seed_demo.ts
 * ------------
 * Inyecta datos de demo completos y consistentes para presentaciones.
 * Ejecutar: npx ts-node prisma/seed_demo.ts
 *
 * ⚠️  UPSERT SAFE: no duplica si ya existen registros con el mismo id/refnum.
 */

import { PrismaClient, WorkflowStep } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────
// Valores de combos (alineados con el frontend)
// ──────────────────────────────────────────────
const RAMOS = ['Autos', 'Daños', 'Salud', 'Vida'] as const;
const SUBRAMOS = [
  'Múltiple Empresarial (MEM)',
  'L. Com Transportes',
  'L. Com Responsabilidad Civil',
  'L. Com Ramos Técnicos',
  'L. Est. Transportes',
  'Property',
  'Financieras & Cyber',
  'Aviación',
  'Otro',
] as const;
const TIPOS_EXP = ['Propia', 'Global'] as const;
const ETAPAS = ['Creado', 'Prospección'] as const;
const PLANES = ['Cuidado Integral Salud', 'Cuidado Integral Plus'] as const;
const PLANMEDS = ['Planmed Híbrido', 'Planmed Estándar', 'Planmed Esencial', 'Planmed Óptimo'] as const;
const GIROS = ['Retail', 'Manufactura', 'Servicios', 'Tecnología'] as const;
const CONDUCTORES = ['Si', 'No'] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ──────────────────────────────────────────────
// Cuentas demo
// ──────────────────────────────────────────────
const ACCOUNTS = [
  { id: 'demo-acc-001', name: 'Grupo Bimbo', identifier: 'BIMBO-001', industry: 'Alimentos', ramo: 'Salud', subramo: 'Múltiple Empresarial (MEM)', primaObjetivo: 5_000_000, vigencia: '2026-01-01' },
  { id: 'demo-acc-002', name: 'Cemex', identifier: 'CEMEX-002', industry: 'Construcción', ramo: 'Daños', subramo: 'Property', primaObjetivo: 12_000_000, vigencia: '2026-02-01' },
  { id: 'demo-acc-003', name: 'America Movil', identifier: 'AMOVIL-003', industry: 'Telecomunicaciones', ramo: 'Salud', subramo: 'Múltiple Empresarial (MEM)', primaObjetivo: 8_500_000, vigencia: '2026-03-01' },
  { id: 'demo-acc-004', name: 'Fomento Económico Mexicano', identifier: 'FEMSA-004', industry: 'Bebidas', ramo: 'Autos', subramo: 'L. Com Transportes', primaObjetivo: 3_200_000, vigencia: '2026-01-15' },
  { id: 'demo-acc-005', name: 'Grupo México', identifier: 'GMEX-005', industry: 'Minería', ramo: 'Daños', subramo: 'L. Com Responsabilidad Civil', primaObjetivo: 15_000_000, vigencia: '2026-04-01' },
  { id: 'demo-acc-006', name: 'Banorte', identifier: 'BANORTE-006', industry: 'Finanzas', ramo: 'Vida', subramo: 'Financieras & Cyber', primaObjetivo: 2_000_000, vigencia: '2026-05-01' },
  { id: 'demo-acc-007', name: 'Walmart de México', identifier: 'WALMEX-007', industry: 'Retail', ramo: 'Salud', subramo: 'Múltiple Empresarial (MEM)', primaObjetivo: 9_000_000, vigencia: '2026-01-01' },
  { id: 'demo-acc-008', name: 'Grupo Elektra', identifier: 'ELEKTRA-008', industry: 'Retail', ramo: 'Daños', subramo: 'L. Com Ramos Técnicos', primaObjetivo: 4_500_000, vigencia: '2026-06-01' },
  { id: 'demo-acc-009', name: 'Alfa', identifier: 'ALFA-009', industry: 'Diversificado', ramo: 'Autos', subramo: 'L. Est. Transportes', primaObjetivo: 1_800_000, vigencia: '2026-02-15' },
  { id: 'demo-acc-010', name: 'El Puerto de Liverpool', identifier: 'LIVERPOOL-010', industry: 'Retail', ramo: 'Vida', subramo: 'Otro', primaObjetivo: 6_700_000, vigencia: '2026-03-15' },
];

// ──────────────────────────────────────────────
// Genera un case.data completo (todos los campos del form de Alta)
// ──────────────────────────────────────────────
function makeCaseData(acc: typeof ACCOUNTS[number]) {
  return {
    // Sección General
    giroNegocio: acc.industry,
    tipoExperiencia: pick(TIPOS_EXP),
    etapa: pick(ETAPAS),
    fechaInicioVigencia: acc.vigencia,
    primaObjetivo: String(acc.primaObjetivo),
    cuidadoIntegral: 'Si',
    cuentaConPlanmed: pick(PLANMEDS),
    plan: pick(PLANES),
    // Sección Agente (valores reales del mock del frontend)
    claveAgente: '26601',
    nombreAgente: 'JUAN PEREZ',
    promotor: 'PROMOTORIA NORTE',
    territorio: 'NORTE',
    oficina: 'MONTERREY',
    canal: 'AGENTE',
    centroCostos: 'CC-001',
    // Sección Producto
    nuevoConducto: pick(CONDUCTORES),
    nearshoring: pick(CONDUCTORES),
    primaCotizada: String(Math.round(acc.primaObjetivo * 0.95)),
    poblacion: String(Math.floor(Math.random() * 900) + 100),
    incisos: String(Math.floor(Math.random() * 5) + 1),
    ubicaciones: String(Math.floor(Math.random() * 10) + 1),
    instanciaFolio: `FOLIO-${Math.floor(Math.random() * 90000) + 10000}`,
    responsableSuscripcion: 'Juan Perez',
    fechaSolicitud: acc.vigencia,
    fechaEntrega: acc.vigencia,
    // Tipos (para Seguimiento/columnas extra)
    tipo: 'Renovación',
    subtipo: 'Normal',
    // Observaciones
    observaciones: `Cuenta ${acc.name} con experiencia ${pick(TIPOS_EXP).toLowerCase()}. Primera renovación ${new Date().getFullYear()}.`,
  };
}

// ──────────────────────────────────────────────
// Plan de casos por cuenta (step → status)
// ──────────────────────────────────────────────
const CASE_PLANS: { step: WorkflowStep; status: string; includeNeg: boolean; includeEm: boolean }[] = [
  { step: 'ALTA', status: 'ACTIVO', includeNeg: false, includeEm: false },
  { step: 'NEGOCIACION', status: 'ACTIVO', includeNeg: true, includeEm: false },
  { step: 'EMISION', status: 'ACTIVO', includeNeg: true, includeEm: true },
  { step: 'TERMINADO', status: 'TERMINADO', includeNeg: true, includeEm: true },
  { step: 'ALTA', status: 'CANCELADO', includeNeg: false, includeEm: false },
];

async function main() {
  // Detect the first user in the DB (works for any userId)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌  No users found. Please register a user first and re-run the seed.');
    process.exit(1);
  }
  console.log(`✅  Seeding as user: ${user.email} (${user.id})`);

  for (const acc of ACCOUNTS) {
    // 1. Upsert Account
    const account = await prisma.account.upsert({
      where: { id: acc.id },
      update: {
        name: acc.name,
        identifier: acc.identifier,
        industry: acc.industry,
        ramo: acc.ramo,
        subramo: acc.subramo,
        primaObjetivo: acc.primaObjetivo,
        fechaInicioVigencia: new Date(acc.vigencia),
        createdBy: user.id,
      },
      create: {
        id: acc.id,
        name: acc.name,
        identifier: acc.identifier,
        industry: acc.industry,
        ramo: acc.ramo,
        subramo: acc.subramo,
        primaObjetivo: acc.primaObjetivo,
        fechaInicioVigencia: new Date(acc.vigencia),
        createdBy: user.id,
      },
    });
    console.log(`  📁  Account upserted: ${account.name}`);

    // 2. Create cases with different stages
    for (let i = 0; i < CASE_PLANS.length; i++) {
      const plan = CASE_PLANS[i];
      const refnum = `DEMO-${acc.id.slice(-3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`;
      const caseData = makeCaseData(acc);

      // Skip if already exists
      const existing = await prisma.case.findUnique({ where: { refnum } });
      if (existing) {
        // Update the data field to fill any gaps
        await prisma.case.update({
          where: { refnum },
          data: { data: caseData, ramo: acc.ramo },
        });
        console.log(`    ↻  Case updated:  ${refnum} [${plan.step}]`);
      } else {
        const created = await prisma.case.create({
          data: {
            refnum,
            accountId: account.id,
            workflowStep: plan.step,
            status: plan.status,
            assignedTo: user.id,
            ramo: acc.ramo,
            data: caseData,
            ...(plan.includeNeg ? {
              negotiationData: {
                create: {
                  estatus: 'En Proceso',
                  seQuedo: true,
                  poblacionAsegurada: parseInt(caseData.poblacion),
                  primaAsegurados: acc.primaObjetivo * 0.9,
                  cuidadoIntegralPoblacion: parseInt(caseData.poblacion),
                  cuidadoIntegralPrima: acc.primaObjetivo * 0.10,
                  observaciones: 'Negociación con condiciones favorables.',
                },
              },
            } : {}),
            ...(plan.includeEm ? {
              emissionData: {
                create: {
                  fechaIngresoFolio: new Date(acc.vigencia),
                  fechaEmision: new Date(acc.vigencia),
                  numPolizas: parseInt(caseData.incisos),
                  poliza: `POL-${Math.floor(Math.random() * 90000) + 10000}`,
                  poblacionEmitida: parseInt(caseData.poblacion),
                  cuidadoIntegralPoblacion: parseInt(caseData.poblacion),
                  cuidadoIntegralPrima: acc.primaObjetivo * 0.10,
                  observaciones: 'Emisión exitosa. Pólizas entregadas al cliente.',
                },
              },
            } : {}),
          },
        });
        console.log(`    ✚  Case created:  ${created.refnum} [${plan.step}] → ${plan.status}`);
      }
    }
  }

  console.log('\n🎉  Demo seed completed successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
