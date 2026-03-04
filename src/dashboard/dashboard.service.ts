import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getStats(userId: string) {
    const [activeAccounts, negotiationCases, cancelledCases, emittedCases, countsByRamo] = await Promise.all([
      this.prisma.account.count({
        where: {
          OR: [{ createdBy: userId }, { createdBy: null }],
        },
      }),
      this.prisma.case.count({
        where: {
          assignedTo: userId,
          workflowStep: 'NEGOCIACION',
          status: { notIn: ['CANCELADO', 'RECHAZADO', 'CERRADO', 'TERMINADO'] },
        },
      }),
      this.prisma.case.count({
        where: {
          assignedTo: userId,
          status: { in: ['CANCELADO', 'RECHAZADO'] },
        },
      }),
      this.prisma.case.count({
        where: {
          assignedTo: userId,
          workflowStep: { in: ['EMISION', 'TERMINADO'] },
        },
      }),
      this.prisma.case.groupBy({
        by: ['ramo'],
        where: {
          assignedTo: userId,
          status: { notIn: ['CANCELADO', 'RECHAZADO'] },
        },
        _count: {
          ramo: true,
        },
      }),
    ]);

    return {
      activeAccounts,
      negotiationCases,
      cancelledCases,
      emittedCases,
      countsByRamo,
    };
  }
}
