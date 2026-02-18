import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { NegotiationService } from './negotiation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('negotiation')
@UseGuards(JwtAuthGuard)
export class NegotiationController {
  constructor(private negotiationService: NegotiationService) { }

  @Put(':caseId')
  async update(@Param('caseId') caseId: string, @Body() body: any) {
    return this.negotiationService.update(caseId, body);
  }
}
