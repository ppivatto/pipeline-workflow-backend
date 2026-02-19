import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) { }

  async getSeguimiento(userId: string) {
    return this.prisma.case.findMany({
      where: {
        assignedTo: userId,
        status: 'ACTIVO',
      },
      include: {
        account: true,
      },
      orderBy: {
        lastModified: 'desc',
      },
    });
  }

  async getRenovaciones(userId: string, accountId?: string) {
    // If accountId is empty string or "undefined", treat it as undefined
    const accId = (accountId === '' || accountId === 'undefined') ? undefined : accountId;

    return this.prisma.case.findMany({
      where: {
        assignedTo: userId,
        accountId: accId,
        workflowStep: {
          in: ['TERMINADO', 'EMISION']
        },
      },
      include: {
        account: true,
        emissionData: true, // Needed for display?
        negotiationData: true, // Needed for display?
      },
      orderBy: {
        lastModified: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.case.findUnique({
      where: { id },
      include: {
        account: true,
        negotiationData: true,
        emissionData: true,
      },
    });

    if (c && c.data) {
      // Merge JSON data into result for frontend
      return { ...c, ...(c.data as object) };
    }
    return c;
  }

  async create(data: any, userId: string) {
    const refnum = `CAS-${Date.now()}`;
    const { accountId, ramo, parentCaseId, ...otherData } = data;

    return this.prisma.case.create({
      data: {
        refnum,
        accountId: accountId || data.account_id, // Handle likely snake_case if any
        parentCaseId: parentCaseId,
        status: data.etapa === 'Ganada' ? 'TERMINADO' : (data.etapa || 'ACTIVO'),
        workflowStep: 'ALTA',
        assignedTo: userId,
        ramo: ramo,
        data: otherData, // Store rest as JSON
      },
    });
  }

  async update(id: string, data: any) {
    const { accountId, ramo, ...otherData } = data;

    // Fetch existing data to merge JSON if needed, or just overwrite/patch
    // Prisma update for JSON is tricky if we want deep merge, but here typically we send full form state
    // For simplicity, we'll update top level fields and replace/merge JSON data

    return this.prisma.case.update({
      where: { id },
      data: {
        ramo: ramo,
        status: data.etapa === 'Ganada' ? 'TERMINADO' : undefined,
        data: otherData,
      },
    });
  }

  async findAll(userId: string, accountId?: string) {
    const accId = (accountId === '' || accountId === 'undefined') ? undefined : accountId;
    return this.prisma.case.findMany({
      where: {
        accountId: accId,
      },
      include: { account: true }
    });
  }
}
