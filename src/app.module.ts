import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { CasesModule } from './cases/cases.module';
import { WorkflowModule } from './workflow/workflow.module';
import { NegotiationModule } from './negotiation/negotiation.module';
import { EmissionModule } from './emission/emission.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AccountsModule,
    AuthModule,
    CasesModule,
    WorkflowModule,
    NegotiationModule,
    EmissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
