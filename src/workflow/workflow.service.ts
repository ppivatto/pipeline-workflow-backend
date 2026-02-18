import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowStep } from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) { }

  async advanceStep(caseId: string, currentStep: WorkflowStep): Promise<any> {
    let nextStep: WorkflowStep;

    switch (currentStep) {
      case 'ALTA':
        nextStep = 'NEGOCIACION';
        break;
      case 'NEGOCIACION':
        nextStep = 'EMISION';
        break;
      case 'EMISION':
        nextStep = 'TERMINADO';
        break;
      default:
        throw new BadRequestException('Cannot advance from this step');
    }

    return this.prisma.case.update({
      where: { id: caseId },
      data: {
        workflowStep: nextStep as any,
        status: nextStep === 'TERMINADO' ? 'TERMINADO' : 'ACTIVO',
      },
    });
  }
}
