import {
    AnonCredsCredentialFormatService,
    AnonCredsModule,
    AnonCredsProofFormatService,
    LegacyIndyCredentialFormatService,
    LegacyIndyProofFormatService,
    V1CredentialProtocol,
    V1ProofProtocol,
  } from '@credo-ts/anoncreds'
  
  import {
    IndyVdrAnonCredsRegistry,
    IndyVdrIndyDidResolver,
    IndyVdrIndyDidRegistrar,
  } from '@credo-ts/indy-vdr'
  
  import { AskarModule } from '@credo-ts/askar'
  
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
    TransportEventTypes,
    ConsoleLogger,
    LogLevel,
  } from '@credo-ts/core'
  import { anoncreds } from '@hyperledger/anoncreds-nodejs'
  import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
  import { agentDependencies, HttpInboundTransport } from '@credo-ts/node'

  import { Injectable } from '@nestjs/common';
  @Injectable()
  export class AgentProvider { 
    private agent: Agent; 
    initializeAgent = async (port, agentConfig = null) => {
    try {
    let endpoints = ['http://' + process.env.AGENT_IP + ':' + port]
  
    if (!agentConfig || agentConfig === null || agentConfig.length === 0) {
      agentConfig = {
        label: process.env.AgentLabel,
        walletConfig: {
          id:  process.env.AgentWalletID,
          key:  process.env.AgentWalletKey,
        },
        autoAcceptConnections: true,
        endpoints: endpoints,
        autoAcceptInvitation: true,
        logger: new ConsoleLogger(LogLevel.trace),
        didCommMimeType: DidCommMimeType.V1,
      }
    }
  
    const legacyIndyCredentialFormat = new LegacyIndyCredentialFormatService()
    const legacyIndyProofFormat = new LegacyIndyProofFormatService()
    const anonCredsCredentialFormatService = new AnonCredsCredentialFormatService()
    const anonCredsProofFormatService = new AnonCredsProofFormatService()
  
  
    
    let modules = {
      askar: new AskarModule({
        ariesAskar,
      }),
      anoncreds: new AnonCredsModule({
        registries: [new IndyVdrAnonCredsRegistry()],
        anoncreds
      }),
      connections: new ConnectionsModule({
        autoAcceptConnections: true,
      }),
      proofs: new ProofsModule({
        proofProtocols: [
          new V1ProofProtocol({
            indyProofFormat: legacyIndyProofFormat,
          }),
          new V2ProofProtocol({
            proofFormats: [legacyIndyProofFormat, anonCredsProofFormatService],
          }),
        ],
      }),
      credentials: new CredentialsModule({
        credentialProtocols: [
          new V1CredentialProtocol({
            indyCredentialFormat: legacyIndyCredentialFormat,
          }),
          new V2CredentialProtocol({
            credentialFormats: [legacyIndyCredentialFormat,anonCredsCredentialFormatService],
          }),
        ],
      }),
      dids: new DidsModule({
        registrars: [new IndyVdrIndyDidRegistrar(), new KeyDidRegistrar()],
        resolvers: [new IndyVdrIndyDidResolver(), new KeyDidResolver(), new WebDidResolver()],
      }),
    }
  
    // A new instance of an agent is created here
    const agent = new Agent({
      config: agentConfig,
      dependencies: agentDependencies,
      modules: modules
    })
    
      const wsTransport = new WsOutboundTransport()
      const httpTransport = new HttpOutboundTransport()
    
    
    // Register a simple `WebSocket` outbound transport
      agent.registerOutboundTransport(wsTransport)
  
    // Register a simple `Http` outbound transport
      agent.registerOutboundTransport(httpTransport)
  

      const httpInbound = new HttpInboundTransport({ port:port })
      agent.registerInboundTransport(httpInbound);
      await agent.initialize()

  
    // return [agent, agentConfig]
    this.agent = agent
    } catch (error) {
  
      process.stderr.write('******** ERROR Error at intialize agent'+ '\n' + error + '\n')
    }
    
  }

  getAgent() : Agent {
      if (!this.agent) {
        throw new Error('Agent not initialized');
      }
      return this.agent;
    }
}