import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentProvider } from './agent';
import { RestRootAgentWithTenants } from './agentType';
import { TenantRecord } from '@credo-ts/tenants';
import { CreateTenantOptionsDto } from './agent.dto';
import {
  DidExchangeState,
  KeyType,
  OutOfBandRecord,
  TypedArrayEncoder,
} from '@credo-ts/core';

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

  // resolveShortUrl
  async resolveShortUrl(tenantId: string, recordId: string) {
    const oobRecord: OutOfBandRecord =
      await this.agent.modules.tenants.withTenantAgent(
        { tenantId },
        async (tenantAgent) => {
          return tenantAgent.oob.findById(recordId);
        },
      );
    if (!oobRecord) {
      throw new NotFoundException(`No such record exist with id ${recordId}`);
    }
    const url = oobRecord.outOfBandInvitation.toUrl({
      domain: this.agent.config.endpoints[0],
    });
    return url;
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

  async resolveDid(did: string) {
    const resolvedDid = await this.agent.dids.resolve(did);
    return resolvedDid;
  }

  async getConnection(tenantId: string) {
    return this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.connections.findAllByQuery({
          state: DidExchangeState.Completed,
        });
      },
    );
  }
}
