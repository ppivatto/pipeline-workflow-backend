import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  async getReportsData(userId: string) {
    // Run both queries in parallel
    const [accounts, cases] = await Promise.all([
      this.prisma.account.findMany({
        where: {
          OR: [{ createdBy: userId }, { createdBy: null }],
        },
        select: { primaObjetivo: true },
      }),
      this.prisma.case.findMany({
        where: { assignedTo: userId },
        select: { status: true, workflowStep: true, ramo: true, updatedAt: true },
      }),
    ]);

    const totalPrimaObjetivo = accounts.reduce((acc, a) => acc + (a.primaObjetivo || 0), 0);

    const activeCases = cases.filter(c => !['CERRADO', 'TERMINADO', 'CANCELADO', 'RECHAZADO'].includes(c.status));
    const closedCases = cases.filter(c => ['CERRADO', 'TERMINADO'].includes(c.status));

    // Agrupar por ramo (para Reporte de Ramo)
    const ramoDistribution = cases.reduce((acc, c) => {
      const ramo = c.ramo || 'Sin Ramo';
      acc[ramo] = (acc[ramo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPrimaObjetivo,
      totalAccounts: accounts.length,
      activeCases: activeCases.length,
      closedCases: closedCases.length,
      totalCases: cases.length,
      ramoDistribution: Object.entries(ramoDistribution).map(([name, value]) => ({ name, value })),
    };
  }

  /** US-12: Raw report - all cases with full data for consulta de folios */
  async getAllCasesRaw() {
    return this.prisma.case.findMany({
      include: {
        account: { select: { id: true, name: true, identifier: true, ramo: true, primaObjetivo: true } },
        negotiationData: true,
        emissionData: true,
      },
      orderBy: { lastModified: 'desc' },
    });
  }
}
