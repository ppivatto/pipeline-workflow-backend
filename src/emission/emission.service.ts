import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class EmissionService {
  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) { }

  private sanitizeData(data: any) {
    const clean: any = {};
    const fields = [
      'fechaIngresoFolio', 'fechaEmision', 'numPolizas',
      'poliza', 'poblacionEmitida', 'observaciones',
      'cuidadoIntegralPoblacion', 'cuidadoIntegralPrima'
    ];

    for (const field of fields) {
      if (data[field] === '' || data[field] === undefined) {
        clean[field] = null;
      } else if (field.startsWith('fecha')) {
        clean[field] = data[field] ? new Date(data[field]) : null;
      } else if (field.toLowerCase().includes('poblacion') || field === 'numPolizas') {
        clean[field] = data[field] ? parseInt(data[field]) : null;
      } else if (field.toLowerCase().includes('prima')) {
        clean[field] = data[field] ? parseFloat(data[field]) : null;
      } else {
        clean[field] = data[field];
      }
    }
    return clean;
  }

  async update(caseId: string, data: any) {
    const sanitized = this.sanitizeData(data);
    const emission = await this.prisma.emissionData.upsert({
      where: { caseId },
      create: { ...sanitized, caseId },
      update: sanitized,
    });

    if (data.finish) {
      await this.workflowService.advanceStep(caseId, 'EMISION');
    }

    return emission;
  }
}
