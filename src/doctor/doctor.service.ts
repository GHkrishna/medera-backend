import { AutoAcceptCredential } from '@credo-ts/core';
import { Injectable } from '@nestjs/common';
import { AgentProvider } from 'src/agent/agent';
import { RestRootAgentWithTenants } from 'src/agent/agentType';

@Injectable()
export class DoctorService {
  private agent: RestRootAgentWithTenants;
  private doctorTenantId: string;

  constructor(private readonly agentProvider: AgentProvider) {
    this.doctorTenantId = process.env.DOCTOR_TENANT_ID;
  }
  getAgentDetails(): string {
    this.agent = this.agentProvider.getAgent();
    return this.agent.config.label;
  }

  getDoctorDetails() {
    const tenantId = this.doctorTenantId;
    return this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.config.label;
      },
    );
  }

  async connectionQr(): Promise<object> {
    const tenantId = this.doctorTenantId;
    const oobRecord = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.oob.createInvitation({
          goalCode: 'DoctorVerify',
          multiUseInvitation: true,
        });
      },
    );
    return {
      invitationUrl: oobRecord?.outOfBandInvitation.toUrl({
        domain: this.agent.config.endpoints[0],
      }),
    };
  }

  async prescribeMedicine(): Promise<string> {
    const tenantId = this.doctorTenantId;
    const oobRecordId = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        const offerOob = await tenantAgent.credentials.createOffer({
          protocolVersion: 'v2',
          credentialFormats: {
            jsonld: {
              credential: {
                '@context': [
                  'https://www.w3.org/2018/credentials/v1',
                  'https://gist.githubusercontent.com/GHkrishna/e3428d5c714d3e05a9d3cd176ece7432/raw/5344106f34e54be48d0ff7e689265a232d3d191a/prescriptionSchema.json',
                ],
                type: ['VerifiableCredential', 'Prescription'],
                issuer: {
                  id: 'did:key:zUC7H6ZsYRfRtHuxRxqF6BJxykJhSmnxRLayvyQub6xPkrkTf1ehWVVuTdoGqaNT6SHGVW4X7VBcjZaYpnUSdB7U9XVvvrbKmGtQyE9HnRf7JX3kuD8NDH2e4PUYjHReYDLhPiG',
                },
                issuanceDate: '2024-12-08T17:03:07.227Z',
                credentialSubject: {
                  prescription: '{"hello": "world"}',
                  patientDetails: '{"hello": "world"}',
                },
              },
              options: {
                proofType: 'Ed25519Signature2018',
                proofPurpose: 'assertionMethod',
              },
            },
          },
          autoAcceptCredential: AutoAcceptCredential.Always,
        });

        const credentialMessage = offerOob.message;
        const outOfBandRecord = await tenantAgent.oob.createInvitation({
          // label: createOfferOptions.label,
          messages: [credentialMessage],
          autoAcceptConnection: true,
          // imageUrl: createOfferOptions?.imageUrl,
          goalCode: 'doctor prescription',
        });

        return outOfBandRecord.id;
      },
    );
    return `${process.env.SHORT_URL_DOMAIN}/agent/${tenantId}/${oobRecordId}/credential`;
  }
}
