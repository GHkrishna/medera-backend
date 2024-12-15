import { TenantsModule } from '@credo-ts/tenants';

import { AskarModule, AskarMultiWalletDatabaseScheme } from '@credo-ts/askar';

import {
  DidsModule,
  ProofsModule,
  V2ProofProtocol,
  CredentialsModule,
  V2CredentialProtocol,
  ConnectionsModule,
  HttpOutboundTransport,
  Agent,
  DidCommMimeType,
  ConsoleLogger,
  LogLevel,
  DifPresentationExchangeProofFormatService,
  JsonLdCredentialFormatService,
  W3cCredentialsModule,
  AutoAcceptCredential,
  AutoAcceptProof,
} from '@credo-ts/core';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { RestRootAgentWithTenants } from './agentType';
import * as e from 'express';
import {
  HederaDidRegistrar,
  HederaDidResolver,
  HederaModule,
} from 'hedera-credo-module';

@Injectable()
export class AgentProvider implements OnModuleInit {
  private agent: RestRootAgentWithTenants;
  async onModuleInit(): Promise<void> {}

  initializeAgent = async (port, expressApp: e.Express, agentConfig = null) => {
    console.log('Initializing agent');
    try {
      const ep =
        process.env.AGENT_ENDPOINT ||
        process.env.AGENT_PROTOCOL + '://' + process.env.AGENT_IP + ':' + port;
      const endpoints = [ep];

      if (!agentConfig || agentConfig === null || agentConfig.length === 0) {
        agentConfig = {
          label: process.env.AgentLabel,
          walletConfig: {
            id: process.env.AgentWalletID,
            key: process.env.AgentWalletKey,
            storage: {
              type: 'postgres',
              config: {
                host: process.env.NEON_DB_HOST,
                connectTimeout: 10,
                maxConnections: 1000,
                idleTimeout: 30000,
              },
              credentials: {
                account: process.env.NEON_DB_ROLE,
                password: process.env.NEON_DB_PASS,
                adminAccount: process.env.NEON_DB_ROLE,
                adminPassword: process.env.NEON_DB_PASS,
              },
            },
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
          multiWalletDatabaseScheme:
            AskarMultiWalletDatabaseScheme.ProfilePerWallet,
        }),
        hedera: new HederaModule({
          operatorId: process.env.ACCOUNT_ID,
          operatorKey: process.env.PRIVATE_KEY,
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
          autoAcceptProofs: AutoAcceptProof.Always,
        }),
        credentials: new CredentialsModule({
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [new JsonLdCredentialFormatService()],
            }),
          ],
          autoAcceptCredentials: AutoAcceptCredential.Always,
        }),
        dids: new DidsModule({
          registrars: [new HederaDidRegistrar()],
          resolvers: [new HederaDidResolver()],
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
      }) as RestRootAgentWithTenants;

      const httpTransport = new HttpOutboundTransport();

      // Register a simple `WebSocket` outbound transport
      // Register a simple `Http` outbound transport
      agent.registerOutboundTransport(httpTransport);

      const httpInbound = new HttpInboundTransport({
        app: expressApp, // Use shared Express app
        // path: '/agent', // Define agent-specific route
        port: 0, // Port is managed by the main server
      });
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
