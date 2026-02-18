import { Module } from '@nestjs/common';
import { EmissionController } from './emission.controller';
import { EmissionService } from './emission.service';

import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [EmissionController],
  providers: [EmissionService]
})
export class EmissionModule { }
