import { Injectable } from '@nestjs/common';
import { AgentProvider } from './agent';
import { RestRootAgentWithTenants } from './agentType';
import { TenantRecord } from '@credo-ts/tenants';
import { CreateTenantOptionsDto } from './agent.dto';
import { KeyType, TypedArrayEncoder } from '@credo-ts/core';

@Injectable()
export class AgentService {
  private agent: RestRootAgentWithTenants;

  constructor(private readonly agentProvider: AgentProvider) {}

  getHello(name: string): string | Promise<string> {
    return 'Hello ' + name;
  }

  getAgentDetails(): string {
    this.agent = this.agentProvider.getAgent();
    return 'hello';
  }

  async createTenant(config: CreateTenantOptionsDto): Promise<TenantRecord> {
    console.log('this is this.agent.modules', await this.agent.modules.tenants);
    const tenantRecord: TenantRecord =
      await this.agent.modules.tenants.createTenant({ config });
    return tenantRecord;
  }

  async createDid(tenantId: string): Promise<string> {
    const didKey = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.dids.create({
          method: 'key',
          options: {
            keyType: KeyType.Bls12381g2,
            privateKey: TypedArrayEncoder.fromString(
              '00000000000000000000000000000bbs',
            ),
          },
        });
      },
    );
    return didKey.didState.did;
  }
}
