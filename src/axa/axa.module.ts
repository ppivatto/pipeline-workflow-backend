import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AxaService } from './axa.service';
import { AxaFolioService } from './axa-folio.service';
import { AxaAgenteService } from './axa-agente.service';
import { AxaController } from './axa.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 15000,
    }),
  ],
  providers: [AxaService, AxaFolioService, AxaAgenteService],
  controllers: [AxaController],
  exports: [AxaService, AxaFolioService, AxaAgenteService],
})
export class AxaModule { }
