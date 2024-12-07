import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentController } from './agent/agent.controller';
import { AgentService } from './agent/agent.service';

@Module({
  imports: [],
  controllers: [AppController, AgentController],
  providers: [AppService, AgentService],
})
export class AppModule {}
