import { Controller, Get, Param, UseGuards, Request, Post, Put, Body, Query } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private casesService: CasesService) { }

  @Get()
  async findAll(@Query('accountId') accountId: string, @Request() req: any) {
    return this.casesService.findAll(req.user.userId, accountId);
  }

  @Get('seguimiento')
  async getSeguimiento(@Request() req: any) {
    return this.casesService.getSeguimiento(req.user.userId);
  }

  @Get('renovaciones')
  async getRenovaciones(@Query('accountId') accountId: string, @Request() req: any) {
    return this.casesService.getRenovaciones(req.user.userId, accountId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.casesService.create(body, req.user.userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.casesService.update(id, body);
  }
}
