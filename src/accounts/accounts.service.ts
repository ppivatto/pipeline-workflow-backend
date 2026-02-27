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
          identifier: data.identifier || `ACC-${Date.now()}`,
          industry: data.giroNegocio || data.industry,
          ramo: data.ramo,
          subramo: data.subramo,
          fechaInicioVigencia: data.fechaInicioVigencia ? new Date(data.fechaInicioVigencia) : new Date(),
          primaObjetivo: parseFloat(data.primaObjetivo) || 0,
          createdBy: userId,
        },
      });

      const { name, identifier, industry, ramo, subramo, fechaInicioVigencia, primaObjetivo, ...caseData } = data;

      const caseRecord = await tx.case.create({
        data: {
          refnum: `CASE-${Date.now()}`,
          accountId: account.id,
          workflowStep: 'ALTA',
          assignedTo: userId,
          ramo: ramo,
          parentCaseId: data.parentCaseId,
          data: caseData,
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
      include: {
        _count: {
          select: {
            cases: {
              where: {
                status: {
                  notIn: ['CERRADO', 'TERMINADO', 'CANCELADO', 'RECHAZADO'],
                },
              },
            },
          },
        },
      },
    });
  }

  async search(query: string, userId: string) {
    return this.prisma.account.findMany({
      where: {
        AND: [
          {
            OR: [
              { createdBy: userId },
              { createdBy: null },
            ],
          },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { identifier: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
      include: {
        cases: {
          orderBy: { updatedAt: 'desc' },
        }
      }
    });
  }

  async checkDuplicate(name: string, userId: string) {
    const existing = await this.prisma.account.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        OR: [
          { createdBy: userId },
          { createdBy: null },
        ],
      },
    });
    return { exists: !!existing, account: existing };
  }
}
