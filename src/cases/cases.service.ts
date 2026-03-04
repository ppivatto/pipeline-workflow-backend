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

  async getCancelled(userId: string) {
    return this.prisma.case.findMany({
      where: {
        assignedTo: userId,
        status: { in: ['CANCELADO', 'RECHAZADO'] },
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

  /** US-9: Check if an open case already exists for account+ramo */
  async checkDuplicateCase(accountId: string, ramo: string) {
    const existing = await this.prisma.case.findFirst({
      where: {
        accountId,
        ramo,
        status: { in: ['ACTIVO'] },
      },
    });
    return { exists: !!existing, refnum: existing?.refnum || null };
  }

  async create(data: any, userId: string) {
    const refnum = `CAS-${Date.now()}`;
    const { accountId, ramo, parentCaseId, ...otherData } = data;

    // US-9: Prevent duplicate case for same account+ramo if one is open
    const resolvedAccountId = accountId || data.account_id;
    if (resolvedAccountId && ramo) {
      const dup = await this.checkDuplicateCase(resolvedAccountId, ramo);
      if (dup.exists) {
        throw new Error(`Ya existe un caso abierto (${dup.refnum}) para esta cuenta con ramo "${ramo}".`);
      }
    }

    return this.prisma.case.create({
      data: {
        refnum,
        accountId: resolvedAccountId,
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
    const { accountId, ramo, rejectedFromNegotiation, ...otherData } = data;

    // Determine status based on business rules
    let newStatus: string | undefined = undefined;
    if (rejectedFromNegotiation) {
      newStatus = 'RECHAZADO';
    } else if (data.etapa === 'Ganada') {
      newStatus = 'TERMINADO';
    }

    return this.prisma.case.update({
      where: { id },
      data: {
        ramo: ramo,
        status: newStatus,
        workflowStep: rejectedFromNegotiation ? 'NEGOCIACION' : undefined,
        data: otherData,
      },
    });
  }

  async findAll(userId: string, accountId?: string, status?: string, workflowStep?: string) {
    const accId = (accountId === '' || accountId === 'undefined') ? undefined : accountId;
    return this.prisma.case.findMany({
      where: {
        accountId: accId,
        status: status ? { equals: status } : undefined,
        workflowStep: workflowStep ? { equals: workflowStep as any } : undefined,
      },
      include: { account: true },
      orderBy: { lastModified: 'desc' },
    });
  }
}
