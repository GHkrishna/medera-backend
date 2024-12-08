import { Injectable } from '@nestjs/common';
import { AgentProvider } from './agent';
import { Agent } from '@credo-ts/core';

@Injectable()
export class AgentService {
    private agent: Agent;

    constructor(private readonly agentProvider: AgentProvider) {
        this.agent= agentProvider.getAgent()
    }

    getHello(name: string): string | Promise<string> {
        return 'Hello '+name;
    }

    getAgentDetails(): string{
        return this.agent.config.label
    }

}
