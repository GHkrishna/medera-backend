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
import { TenantsModule } from '@credo-ts/tenants';
import { TenantAgent } from '@credo-ts/tenants/build/TenantAgent';
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
  multiTenant: boolean;
  baseUrl: string;
}) {
  const baseModules = {
    connections: new ConnectionsModule({
      autoAcceptConnections: options.autoAcceptConnections,
    }),
    proofs: new ProofsModule({
      autoAcceptProofs: options.autoAcceptProofs,
      proofProtocols: [
        new V2ProofProtocol({
          proofFormats: [new DifPresentationExchangeProofFormatService()],
        }),
      ],
    }),
    credentials: new CredentialsModule({
      autoAcceptCredentials: options.autoAcceptCredentials,
      credentialProtocols: [
        new V2CredentialProtocol({
          credentialFormats: [new JsonLdCredentialFormatService()],
        }),
      ],
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
      registrars: [new KeyDidRegistrar(), new PeerDidRegistrar()],
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
  } = baseModules;

  if (options.multiTenant) {
    modules.tenants = new TenantsModule({
      sessionLimit: Infinity,
    });
  }

  return modules;
}
