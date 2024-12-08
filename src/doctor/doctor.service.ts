import { AutoAcceptCredential } from '@credo-ts/core';
import { Injectable } from '@nestjs/common';
import { AgentProvider } from 'src/agent/agent';
import { RestRootAgentWithTenants } from 'src/agent/agentType';
import { PrescriptionDto } from './doctor.dto';

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

  async prescribeMedicine(prescriptionDto: PrescriptionDto): Promise<object> {
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
                  id: process.env.DOCTOR_DID,
                },
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                  prescription: prescriptionDto.prescription,
                  patientDetails: prescriptionDto.patientDetails,
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
    return {
      credentialUrl: `${process.env.SHORT_URL_DOMAIN}/agent/${tenantId}/${oobRecordId}/credential`,
    };
  }
}
