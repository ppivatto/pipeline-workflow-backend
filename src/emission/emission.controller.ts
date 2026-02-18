import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { EmissionService } from './emission.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('emission')
@UseGuards(JwtAuthGuard)
export class EmissionController {
  constructor(private emissionService: EmissionService) { }

  @Put(':caseId')
  async update(@Param('caseId') caseId: string, @Body() body: any) {
    return this.emissionService.update(caseId, body);
  }
}
