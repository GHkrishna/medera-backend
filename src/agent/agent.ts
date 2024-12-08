import { AnonCredsModule } from '@credo-ts/anoncreds';
import { TenantsModule } from '@credo-ts/tenants';

import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidResolver,
  IndyVdrIndyDidRegistrar,
} from '@credo-ts/indy-vdr';

import { AskarModule } from '@credo-ts/askar';

import {
  DidsModule,
  ProofsModule,
  V2ProofProtocol,
  CredentialsModule,
  V2CredentialProtocol,
  ConnectionsModule,
  KeyDidRegistrar,
  KeyDidResolver,
  WebDidResolver,
  HttpOutboundTransport,
  WsOutboundTransport,
  Agent,
  DidCommMimeType,
  ConsoleLogger,
  LogLevel,
  DifPresentationExchangeProofFormatService,
  JsonLdCredentialFormatService,
  W3cCredentialsModule,
} from '@credo-ts/core';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { RestRootAgentWithTenants } from './agentType';
@Injectable()
export class AgentProvider implements OnModuleInit {
  private agent: RestRootAgentWithTenants;
  async onModuleInit(): Promise<void> {
    await this.initializeAgent(4001);
  }
  initializeAgent = async (port, agentConfig = null) => {
    console.log('Initializing agent');
    try {
      const endpoints = ['http://' + process.env.AGENT_IP + ':' + port];

      if (!agentConfig || agentConfig === null || agentConfig.length === 0) {
        agentConfig = {
          label: process.env.AgentLabel,
          walletConfig: {
            id: process.env.AgentWalletID,
            key: process.env.AgentWalletKey,
          },
          autoAcceptConnections: true,
          endpoints: endpoints,
          autoAcceptInvitation: true,
          logger: new ConsoleLogger(LogLevel.trace),
          didCommMimeType: DidCommMimeType.V1,
        };
      }

      const modules = {
        askar: new AskarModule({
          ariesAskar,
        }),
        anoncreds: new AnonCredsModule({
          registries: [new IndyVdrAnonCredsRegistry()],
          anoncreds,
        }),
        connections: new ConnectionsModule({
          autoAcceptConnections: true,
        }),
        proofs: new ProofsModule({
          proofProtocols: [
            new V2ProofProtocol({
              proofFormats: [new DifPresentationExchangeProofFormatService()],
            }),
          ],
        }),
        credentials: new CredentialsModule({
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [new JsonLdCredentialFormatService()],
            }),
          ],
        }),
        dids: new DidsModule({
          registrars: [new IndyVdrIndyDidRegistrar(), new KeyDidRegistrar()],
          resolvers: [
            new IndyVdrIndyDidResolver(),
            new KeyDidResolver(),
            new WebDidResolver(),
          ],
        }),
        tenants: new TenantsModule<typeof modules>({
          sessionAcquireTimeout:
            Number(process.env.SESSION_ACQUIRE_TIMEOUT) || Infinity,
          sessionLimit: Number(process.env.SESSION_LIMIT) || Infinity,
        }),
        w3cCredentials: new W3cCredentialsModule(),
      };
      // A new instance of an agent is created here
      const agent = new Agent({
        config: agentConfig,
        dependencies: agentDependencies,
        modules: modules,
      });

      const wsTransport = new WsOutboundTransport();
      const httpTransport = new HttpOutboundTransport();

      // Register a simple `WebSocket` outbound transport
      agent.registerOutboundTransport(wsTransport);

      // Register a simple `Http` outbound transport
      agent.registerOutboundTransport(httpTransport);

      const httpInbound = new HttpInboundTransport({ port: port });
      agent.registerInboundTransport(httpInbound);
      await agent.initialize();

      // return [agent, agentConfig]
      this.agent = agent;
    } catch (error) {
      process.stderr.write(
        '******** ERROR Error at intialize agent' + '\n' + error + '\n',
      );
    }
  };

  getAgent(): RestRootAgentWithTenants {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }
    return this.agent;
  }
}