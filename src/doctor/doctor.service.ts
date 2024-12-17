import {
  AutoAcceptCredential,
  CredentialRole,
  CredentialState,
  DidExchangeState,
} from '@credo-ts/core';
import { Injectable } from '@nestjs/common';
import { AgentProvider } from 'src/agent/agent';
import { RestRootAgentWithTenants } from 'src/agent/agentType';
import { PatientDetails, PrescriptionDto } from './doctor.dto';

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
          goalCode: process.env.DOCTOR_DID,
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

  async getConnectionList(): Promise<object> {
    const tenantId = this.doctorTenantId;
    const connectionRecords = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.connections.findAllByQuery({
          state: DidExchangeState.Completed,
        });
      },
    );
    return connectionRecords.map((connectionRecord) => {
      return { id: connectionRecord.id, label: connectionRecord.theirLabel };
    });
  }

  // getCredentialByPatient
  async getCredentialByPatient(
    patientConnectionIds: PatientDetails,
  ): Promise<object> {
    const tenantId = this.doctorTenantId;
    const credentialRecords = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.credentials.findAllByQuery({
          connectionId: patientConnectionIds.connectionIds,
          role: CredentialRole.Issuer,
          state: CredentialState.Done,
        });
      },
    );
    return credentialRecords.map((credentialRecord) => {
      return {
        id: credentialRecord.id,
        createdAt: credentialRecord.createdAt,
        updatedAt: credentialRecord.updatedAt,
        credentialAttributes: credentialRecord.credentialAttributes,
      };
    });
  }

  // getCredentialByPatient
  async getAllPrescriptions() {
    const tenantId = this.doctorTenantId;
    const prescriptionDetails =
      await this.agent.modules.tenants.withTenantAgent(
        { tenantId },
        async (tenantAgent) => {
          return tenantAgent.credentials.findAllByQuery({
            role: CredentialRole.Issuer,
          });
        },
      );
    return prescriptionDetails;
  }

  // getCredentialByPatient
  async getPrescriptionByPrescriptionId(prescriptionId: string) {
    const tenantId = this.doctorTenantId;
    const prescriptionDetails =
      await this.agent.modules.tenants.withTenantAgent(
        { tenantId },
        async (tenantAgent) => {
          return tenantAgent.credentials.getFormatData(prescriptionId);
        },
      );
    return prescriptionDetails;
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
                  process.env.PRESCRIPTION_SCHEMA,
                ],
                type: ['VerifiableCredential', 'Prescription'],
                issuer: {
                  id: process.env.DOCTOR_DID,
                },
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                  id: prescriptionDto?.did ? prescriptionDto.did : undefined,
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
          goalCode: process.env.DOCTOR_DID,
        });

        return outOfBandRecord.id;
      },
    );
    return {
      credentialUrl: `${process.env.SHORT_URL_DOMAIN}/agent/${tenantId}/${oobRecordId}`,
    };
  }
}
