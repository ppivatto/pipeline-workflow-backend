import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class NegotiationService {
  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) { }

  private sanitizeData(data: any) {
    const clean: any = {};
    const fields = [
      'seQuedo', 'poblacionAsegurada', 'estatus', 'primaAsegurados',
      'motivoNoGanado', 'aseguradoraGanadora', 'primaCompetencia',
      'cuidadoIntegralPoblacion', 'cuidadoIntegralPrima', 'observaciones'
    ];

    for (const field of fields) {
      if (data[field] === '' || data[field] === undefined) {
        clean[field] = null;
      } else if (field.includes('poblacion') || field === 'poblacionAsegurada') {
        clean[field] = data[field] ? parseInt(data[field]) : null;
      } else if (field.includes('prima') || field === 'primaCompetencia') {
        clean[field] = data[field] ? parseFloat(data[field]) : null;
      } else {
        clean[field] = data[field];
      }
    }
    return clean;
  }

  async update(caseId: string, data: any) {
    const sanitized = this.sanitizeData(data);
    const negotiation = await this.prisma.negotiationData.upsert({
      where: { caseId },
      create: { ...sanitized, caseId },
      update: sanitized,
    });

    if (data.advance) {
      await this.workflowService.advanceStep(caseId, 'NEGOCIACION');
    }

    return negotiation;
  }
}
