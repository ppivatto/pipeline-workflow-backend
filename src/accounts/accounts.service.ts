import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) { }

  async create(data: any, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          name: data.name,
          identifier: data.identifier,
          industry: data.industry,
          ramo: data.ramo,
          subramo: data.subramo,
          fechaInicioVigencia: new Date(data.fechaInicioVigencia),
          primaObjetivo: parseFloat(data.primaObjetivo),
          createdBy: userId,
        },
      });

      const caseRecord = await tx.case.create({
        data: {
          refnum: `CASE-${Date.now()}`,
          accountId: account.id,
          workflowStep: 'ALTA',
          assignedTo: userId,
        },
      });

      return { account, case: caseRecord };
    });
  }

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { createdBy: null },
        ],
      },
      include: { cases: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
    });
  }
}
