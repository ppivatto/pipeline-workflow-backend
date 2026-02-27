import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getStats(userId: string) {
    const activeAccounts = await this.prisma.account.count({
      where: {
        OR: [{ createdBy: userId }, { createdBy: null }],
      },
    });

    const negotiationCases = await this.prisma.case.count({
      where: {
        assignedTo: userId,
        workflowStep: 'NEGOCIACION',
        status: { notIn: ['CANCELADO', 'RECHAZADO', 'CERRADO', 'TERMINADO'] },
      },
    });

    const cancelledCases = await this.prisma.case.count({
      where: {
        assignedTo: userId,
        status: { in: ['CANCELADO', 'RECHAZADO'] },
      },
    });

    const emittedCases = await this.prisma.case.count({
      where: {
        assignedTo: userId,
        workflowStep: { in: ['EMISION', 'TERMINADO'] },
      },
    });

    const countsByRamo = await this.prisma.case.groupBy({
      by: ['ramo'],
      where: {
        assignedTo: userId,
        status: { notIn: ['CANCELADO', 'RECHAZADO'] },
      },
      _count: {
        ramo: true,
      },
    });

    return {
      activeAccounts,
      negotiationCases,
      cancelledCases,
      emittedCases,
      countsByRamo,
    };
  }
}
