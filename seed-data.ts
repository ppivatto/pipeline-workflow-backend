
import { PrismaClient, WorkflowStep as PrismaWorkflowStep } from '@prisma/client';

const prisma = new PrismaClient();

const accountsData = [
  { name: 'Grupo Bimbo', identifier: 'BIMBO-001', industry: 'Alimentos', ramo: 'Vida', subramo: 'Grupo', primaObjetivo: 5000000, fechaInicioVigencia: new Date() },
  { name: 'Cemex', identifier: 'CEMEX-002', industry: 'Construcción', ramo: 'Daños', subramo: 'Incendio', primaObjetivo: 12000000, fechaInicioVigencia: new Date() },
  { name: 'America Movil', identifier: 'AMOVIL-003', industry: 'Telecomunicaciones', ramo: 'GMM', subramo: 'Colectivo', primaObjetivo: 8500000, fechaInicioVigencia: new Date() },
  { name: 'Fomento Económico Mexicano', identifier: 'FEMSA-004', industry: 'Bebidas', ramo: 'Autos', subramo: 'Flotilla', primaObjetivo: 3200000, fechaInicioVigencia: new Date() },
  { name: 'Grupo México', identifier: 'GMEX-005', industry: 'Minería', ramo: 'Daños', subramo: 'Responsabilidad Civil', primaObjetivo: 15000000, fechaInicioVigencia: new Date() },
  { name: 'Banorte', identifier: 'BANORTE-006', industry: 'Finanzas', ramo: 'Vida', subramo: 'Individual', primaObjetivo: 2000000, fechaInicioVigencia: new Date() },
  { name: 'Walmart de México', identifier: 'WALMEX-007', industry: 'Retail', ramo: 'GMM', subramo: 'Colectivo', primaObjetivo: 9000000, fechaInicioVigencia: new Date() },
  { name: 'Grupo Elektra', identifier: 'ELEKTRA-008', industry: 'Retail', ramo: 'Daños', subramo: 'Robo', primaObjetivo: 4500000, fechaInicioVigencia: new Date() },
  { name: 'Alfa', identifier: 'ALFA-009', industry: 'Diversificado', ramo: 'Autos', subramo: 'Ejecutivo', primaObjetivo: 1800000, fechaInicioVigencia: new Date() },
  { name: 'El Puerto de Liverpool', identifier: 'LIVERPOOL-010', industry: 'Retail', ramo: 'Vida', subramo: 'Grupo', primaObjetivo: 6700000, fechaInicioVigencia: new Date() },
];

const caseSteps = ['ALTA', 'NEGOCIACION', 'EMISION', 'TERMINADO']; // Strings matching enum values if possible or mapped
const caseStatuses = ['ACTIVO', 'ACTIVO', 'ACTIVO', 'TERMINADO'];
const ramos = ['Vida', 'GMM', 'Daños', 'Autos'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  const email = 'rfer@mail.com';
  console.log(`Looking for user ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User ${email} not found!`);
    // Try fallback
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      console.log(`Using fallback user: ${firstUser.email}`);
      // seed for first user
      await seedForUser(firstUser.id);
    } else {
      console.error('No users found in database to seed for.');
    }
    return;
  }

  await seedForUser(user.id);
}

async function seedForUser(userId: string) {
  console.log(`Seeding data for user ID: ${userId}`);

  for (const accData of accountsData) {
    try {
      // Create Account
      // Check if account identifier exists to avoid duplicates or upsert
      const account = await prisma.account.create({
        data: {
          ...accData,
          createdBy: userId,
        }
      });
      console.log(`Created account: ${account.name}`);

      // Create Cases
      const numCases = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numCases; i++) {
        const stepIndex = Math.floor(Math.random() * caseSteps.length);
        const stepStr = caseSteps[stepIndex];
        // Map string to enum
        let workflowStep: PrismaWorkflowStep = 'ALTA';
        if (stepStr === 'NEGOCIACION') workflowStep = 'NEGOCIACION';
        if (stepStr === 'EMISION') workflowStep = 'EMISION';
        if (stepStr === 'TERMINADO') workflowStep = 'TERMINADO';

        const status = caseStatuses[stepIndex];
        const ramo = getRandomItem(ramos);
        const refnum = `CAS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const kase = await prisma.case.create({
          data: {
            refnum,
            accountId: account.id,
            workflowStep,
            status: status === 'TERMINADO' ? 'TERMINADO' : 'ACTIVO', // Simplified status mapping
            assignedTo: userId,
            ramo: ramo,
            data: {
              tipo: 'Renovación',
              subtipo: 'Normal',
              prioridad: 'Alta'
            },
            // Negotiation Data
            ...(workflowStep === 'NEGOCIACION' || workflowStep === 'EMISION' || workflowStep === 'TERMINADO' ? {
              negotiationData: {
                create: {
                  estatus: 'En Proceso',
                  seQuedo: true,
                  cuidadoIntegralPrima: 10000,
                  observaciones: 'Negociación fluida'
                }
              }
            } : {}),
            // Emission Data
            ...(workflowStep === 'EMISION' || workflowStep === 'TERMINADO' ? {
              emissionData: {
                create: {
                  numPolizas: 1,
                  poliza: `POL-${Math.floor(Math.random() * 10000)}`,
                  fechaEmision: new Date(),
                  observaciones: 'Emitido correctamente'
                }
              }
            } : {})
          }
        });
        console.log(`  -> Created case ${kase.refnum} [${workflowStep}]`);
      }
    } catch (e) {
      console.error(`Error creating data for account ${accData.name}:`, e);
    }
  }
  console.log('Seeding complete.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
