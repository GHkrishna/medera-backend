import {
  AnonCredsRegistry,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1ProofProtocol,
  AnonCredsProofFormatService,
  V1CredentialProtocol,
  AnonCredsCredentialFormatService,
  AnonCredsModule,
} from '@credo-ts/anoncreds';
import { AskarModule, AskarMultiWalletDatabaseScheme } from '@credo-ts/askar';
import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  ConnectionsModule,
  CredentialsModule,
  DidsModule,
  DifPresentationExchangeProofFormatService,
  JsonLdCredentialFormatService,
  JwkDidRegistrar,
  JwkDidResolver,
  KeyDidRegistrar,
  KeyDidResolver,
  MediatorModule,
  PeerDidRegistrar,
  PeerDidResolver,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
  W3cCredentialsModule,
  WebDidResolver,
} from '@credo-ts/core';
import { IndyVdrPoolConfig, IndyVdrModule } from '@credo-ts/indy-vdr';
import { TenantsModule } from '@credo-ts/tenants';
import { TenantAgent } from '@credo-ts/tenants/build/TenantAgent';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';

type ModulesWithoutTenants = Omit<
  ReturnType<typeof getAgentModules>,
  'tenants'
>;

export type RestRootAgent = Agent<ModulesWithoutTenants>;
export type RestRootAgentWithTenants = Agent<
  ModulesWithoutTenants & { tenants: TenantsModule<ModulesWithoutTenants> }
>;
export type RestTenantAgent = TenantAgent<ModulesWithoutTenants>;
export type RestAgent =
  | RestRootAgent
  | RestTenantAgent
  | RestRootAgentWithTenants;

export function getAgentModules(options: {
  autoAcceptConnections: boolean;
  autoAcceptProofs: AutoAcceptProof;
  autoAcceptCredentials: AutoAcceptCredential;
  autoAcceptMediationRequests: boolean;
  indyLedgers?: [IndyVdrPoolConfig, ...IndyVdrPoolConfig[]];
  extraAnonCredsRegistries?: AnonCredsRegistry[];
  multiTenant: boolean;
  baseUrl: string;
}) {
  const legacyIndyCredentialFormatService =
    new LegacyIndyCredentialFormatService();
  const legacyIndyProofFormatService = new LegacyIndyProofFormatService();

  const baseModules = {
    connections: new ConnectionsModule({
      autoAcceptConnections: options.autoAcceptConnections,
    }),
    proofs: new ProofsModule({
      autoAcceptProofs: options.autoAcceptProofs,
      proofProtocols: [
        new V1ProofProtocol({
          indyProofFormat: legacyIndyProofFormatService,
        }),
        new V2ProofProtocol({
          proofFormats: [
            legacyIndyProofFormatService,
            new AnonCredsProofFormatService(),
            new DifPresentationExchangeProofFormatService(),
          ],
        }),
      ],
    }),
    credentials: new CredentialsModule({
      autoAcceptCredentials: options.autoAcceptCredentials,
      credentialProtocols: [
        new V1CredentialProtocol({
          indyCredentialFormat: legacyIndyCredentialFormatService,
        }),
        new V2CredentialProtocol({
          credentialFormats: [
            legacyIndyCredentialFormatService,
            new AnonCredsCredentialFormatService(),
            new JsonLdCredentialFormatService(),
          ],
        }),
      ],
    }),
    anoncreds: new AnonCredsModule({
      registries: (options.extraAnonCredsRegistries ?? []) as [
        AnonCredsRegistry,
      ],
      anoncreds,
    }),
    askar: new AskarModule({
      ariesAskar,
      multiWalletDatabaseScheme:
        AskarMultiWalletDatabaseScheme.ProfilePerWallet,
    }),
    mediator: new MediatorModule({
      autoAcceptMediationRequests: options.autoAcceptMediationRequests,
    }),
    dids: new DidsModule({
      registrars: [
        new KeyDidRegistrar(),
        new JwkDidRegistrar(),
        new PeerDidRegistrar(),
      ],
      resolvers: [
        new WebDidResolver(),
        new KeyDidResolver(),
        new JwkDidResolver(),
        new PeerDidResolver(),
      ],
    }),
    w3cCredentials: new W3cCredentialsModule(),
  } as const;

  const modules: typeof baseModules & {
    tenants?: TenantsModule<typeof baseModules>;
    indyVdr?: IndyVdrModule;
  } = baseModules;

  if (options.multiTenant) {
    modules.tenants = new TenantsModule({
      sessionLimit: Infinity,
    });
  }

  return modules;
}
