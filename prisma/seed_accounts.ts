import { PrismaClient, WorkflowStep } from '@prisma/client';

const prisma = new PrismaClient();
const userId = "83a37804-ac86-428a-a549-20ee4091d4b3";

async function main() {
  console.log('Seeding accounts and cases...');

  const accountsData = [
    {
      id: '99851013',
      name: 'Walmart SA DE CV MEXICO',
      identifier: 'WALMAR8758473AA',
      industry: 'Retail',
      ramo: 'Autos',
      subramo: 'Flotillas',
      fechaInicioVigencia: new Date('2026-02-01'),
      primaObjetivo: 1500000,
      createdBy: null,
    },
    {
      id: '99825018',
      name: 'Acme Corp',
      identifier: 'ACME999999',
      industry: 'Manufacturing',
      ramo: 'Vida',
      subramo: 'Grupo',
      fechaInicioVigencia: new Date('2026-03-01'),
      primaObjetivo: 500000,
      createdBy: null,
    }
  ];

  for (const acc of accountsData) {
    const { id, ...data } = acc;
    await prisma.account.upsert({
      where: { id },
      update: data,
      create: { id, ...data }
    });
    console.log(`Ensured account: ${acc.name}`);
  }

  const casesData = [
    {
      refnum: '260210-000003',
      accountId: '99851013',
      workflowStep: WorkflowStep.ALTA,
      status: 'Creado',
      assignedTo: userId,
      ramo: 'Autos',
      data: {
        subramo: 'Flotillas',
        giroNegocio: 'Retail (Supermercados)',
        tipoExperiencia: 'Con Siniestralidad',
        etapa: 'Creado',
        fechaInicioVigencia: '2026-02-01',
        primaObjetivo: '1500000',
        claveAgente: '26601',
        nuevoConducto: 'Agentes',
        nearshoring: 'No',
        observaciones: 'Cuenta estratégica renovada mensualmente.'
      }
    },
    {
      refnum: 'CAS-1002',
      accountId: '99851013',
      workflowStep: WorkflowStep.NEGOCIACION,
      status: 'EN_NEGOCIACION',
      assignedTo: userId,
      ramo: 'Vida',
      data: {
        subramo: 'Grupo',
        giroNegocio: 'Retail',
        tipoExperiencia: 'N/A',
        etapa: 'Negociación',
        fechaInicioVigencia: '2026-05-20',
        primaObjetivo: '250000',
        claveAgente: '12345',
        nuevoConducto: 'Corredores',
        nearshoring: 'No',
        observaciones: 'En proceso de revisión de tasas.'
      }
    }
  ];

  for (const c of casesData) {
    await prisma.case.upsert({
      where: { refnum: c.refnum },
      update: c,
      create: c
    });
    console.log(`Ensured case: ${c.refnum}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
