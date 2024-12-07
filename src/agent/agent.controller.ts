import { Controller, Get, Post, Query } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
    constructor(private agentService: AgentService) {}

    @Get('/')
    public async getHello(@Query('name') name: string): Promise<string> {
        return this.agentService.getHello(name)
    }
}
