import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentController } from './agent/agent.controller';
import { AgentService } from './agent/agent.service';
import { AgentProvider } from './agent/agent';
import { DoctorController } from './doctor/doctor.controller';
import { DoctorService } from './doctor/doctor.service';

@Module({
  imports: [],
  controllers: [AppController, AgentController, DoctorController],
  providers: [AppService, AgentService, AgentProvider, DoctorService],
})
export class AppModule {}
