import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) { }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.accountsService.create(body, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.accountsService.findAll(req.user.userId);
  }
}
