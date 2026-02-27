/**
 * patch_case_data.ts
 * ------------------
 * Rellena el campo `data` (JSON) de todos los casos que tengan datos incompletos.
 * Ejecutar: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/patch_case_data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Agentes mock (igual que el frontend)
const AGENT = {
  claveAgente: '26601',
  nombreAgente: 'JUAN PEREZ',
  promotor: 'PROMOTORIA NORTE',
  territorio: 'NORTE',
  oficina: 'MONTERREY',
  canal: 'AGENTE',
  centroCostos: 'CC-001',
};

const PLANES = ['Cuidado Integral Salud', 'Cuidado Integral Plus'];
const PLANMEDS = ['Planmed Híbrido', 'Planmed Estándar', 'Planmed Esencial', 'Planmed Óptimo'];
const TIPOS_EXP = ['Propia', 'Global'];
const ETAPAS = ['Creado', 'Prospección'];
const GIROS: Record<string, string> = {
  Alimentos: 'Manufactura',
  Construcción: 'Servicios',
  Telecomunicaciones: 'Tecnología',
  Bebidas: 'Manufactura',
  Minería: 'Servicios',
  Finanzas: 'Servicios',
  Retail: 'Retail',
  Diversificado: 'Servicios',
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toDateStr(d: Date | null | undefined): string {
  if (!d) return '2026-01-01';
  return d.toISOString().substring(0, 10);
}

async function main() {
  const cases = await prisma.case.findMany({
    include: { account: true },
  });

  console.log(`Found ${cases.length} cases total.`);

  let patched = 0;

  for (const c of cases) {
    const existing = (c.data as any) || {};

    // Detectar si le faltan campos clave del form de Alta
    const needsPatch =
      !existing.claveAgente ||
      !existing.tipoExperiencia ||
      !existing.giroNegocio ||
      !existing.observaciones ||
      !existing.fechaInicioVigencia;

    if (!needsPatch) continue;

    const acc = c.account;
    const giro = GIROS[acc?.industry || ''] || 'Servicios';
    const primaObjetivo = acc?.primaObjetivo ?? 1000000;
    const vigencia = toDateStr(acc?.fechaInicioVigencia ?? new Date('2026-01-01'));
    const poblacion = String(Math.floor(Math.random() * 900) + 100);

    const fullData = {
      // Mantener lo que ya existía
      ...existing,
      // Rellenar campos vacíos
      giroNegocio: existing.giroNegocio || giro,
      tipoExperiencia: existing.tipoExperiencia || pick(TIPOS_EXP),
      etapa: existing.etapa || pick(ETAPAS),
      fechaInicioVigencia: existing.fechaInicioVigencia || vigencia,
      primaObjetivo: existing.primaObjetivo || String(primaObjetivo),
      cuidadoIntegral: existing.cuidadoIntegral || 'Si',
      cuentaConPlanmed: existing.cuentaConPlanmed || pick(PLANMEDS),
      plan: existing.plan || pick(PLANES),
      // Agente
      ...AGENT,
      // Producto
      nuevoConducto: existing.nuevoConducto || pick(['Si', 'No']),
      nearshoring: existing.nearshoring || pick(['Si', 'No']),
      primaCotizada: existing.primaCotizada || String(Math.round(primaObjetivo * 0.95)),
      poblacion: existing.poblacion || poblacion,
      incisos: existing.incisos || String(Math.floor(Math.random() * 5) + 1),
      ubicaciones: existing.ubicaciones || String(Math.floor(Math.random() * 10) + 1),
      instanciaFolio: existing.instanciaFolio || `FOLIO-${Math.floor(Math.random() * 90000) + 10000}`,
      responsableSuscripcion: existing.responsableSuscripcion || 'Juan Perez',
      fechaSolicitud: existing.fechaSolicitud || vigencia,
      fechaEntrega: existing.fechaEntrega || vigencia,
      tipo: existing.tipo || 'Renovación',
      subtipo: existing.subtipo || 'Normal',
      observaciones: existing.observaciones ||
        `Cuenta ${acc?.name || ''} — experiencia ${pick(TIPOS_EXP).toLowerCase()}. Renovación ${new Date().getFullYear()}.`,
    };

    await prisma.case.update({
      where: { id: c.id },
      data: { data: fullData },
    });

    console.log(`  ✓  Patched: ${c.refnum} (account: ${acc?.name || 'N/A'})`);
    patched++;
  }

  console.log(`\n✅  Done. ${patched} / ${cases.length} cases patched.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
