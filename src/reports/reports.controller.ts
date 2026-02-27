import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) { }

  @Get('data')
  async getReportsData(@Request() req: any) {
    return this.reportsService.getReportsData(req.user.userId);
  }
}
