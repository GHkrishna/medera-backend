import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentController } from './agent/agent.controller';
import { AgentService } from './agent/agent.service';
import { AgentProvider } from './agent/agent';

@Module({
  imports: [],
  controllers: [AppController, AgentController],
  providers: [AppService, AgentService, AgentProvider],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly agentProvider: AgentProvider) {}

  async onModuleInit() {
    await this.agentProvider.initializeAgent(4001);
  }
}

