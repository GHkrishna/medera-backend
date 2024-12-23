import {
  AutoAcceptCredential,
  CredentialRole,
  CredentialState,
  DidExchangeState,
  ProofRole,
  ProofState,
} from '@credo-ts/core';
import { Injectable } from '@nestjs/common';
import { AgentProvider } from 'src/agent/agent';
import { RestRootAgentWithTenants } from 'src/agent/agentType';
import { PatientDetails, ReceiptDto } from './pharmacy.dto';

@Injectable()
export class PharmacyService {
  private agent: RestRootAgentWithTenants;
  private pharmacyTenantId: string;

  constructor(private readonly agentProvider: AgentProvider) {
    this.pharmacyTenantId = process.env.PRARMACY_TENANT_ID;
  }
  getAgentDetails(): string {
    this.agent = this.agentProvider.getAgent();
    return this.agent.config.label;
  }

  getPharmacyDetails() {
    const tenantId = this.pharmacyTenantId;
    return this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.config.label;
      },
    );
  }

  async connectionQr(): Promise<object> {
    const tenantId = this.pharmacyTenantId;
    const oobRecord = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.oob.createInvitation({
          goalCode: process.env.PHARMACY_DID,
          goal: 'verify-prescription',
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
    const tenantId = this.pharmacyTenantId;
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

  async getVerifiedPrescreptionDetailById(prescriptionId: string) {
    const tenantId = this.pharmacyTenantId;
    let proof;
    await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        proof = await tenantAgent.proofs.getFormatData(prescriptionId);
      },
    );
    return proof;
  }

  async getVerifiedPrescreptionDetails(): Promise<any> {
    const tenantId = this.pharmacyTenantId;
    const presentationRecords =
      await this.agent.modules.tenants.withTenantAgent(
        { tenantId },
        async (tenantAgent) => {
          return tenantAgent.proofs.findAllByQuery({
            state: ProofState.Done,
            role: ProofRole.Verifier,
          });
        },
      );
    return presentationRecords;
  }

  // getCredentialByPatient
  async getCredentialByPatient(
    patientConnectionIds: PatientDetails,
  ): Promise<object> {
    const tenantId = this.pharmacyTenantId;
    const credentialRecords = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.credentials.findAllByQuery({
          connectionId: patientConnectionIds.connectionId,
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
  async getAllReceipts(): Promise<object> {
    const tenantId = this.pharmacyTenantId;
    const credentialRecords = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.credentials.getAll();
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
  async getReceiptById(receiptId: string) {
    const tenantId = this.pharmacyTenantId;
    const credentialRecords = await this.agent.modules.tenants.withTenantAgent(
      { tenantId },
      async (tenantAgent) => {
        return tenantAgent.credentials.getFormatData(receiptId);
      },
    );
    return credentialRecords;
  }

  async provideReceipt(receiptDto: ReceiptDto): Promise<object> {
    const tenantId = this.pharmacyTenantId;
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
                  process.env.PHARMACY_RECEIPT_SCHEMA,
                ],
                type: ['VerifiableCredential', 'PharmacyReceipt'],
                issuer: {
                  id: process.env.PHARMACY_DID,
                },
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                  id: receiptDto?.did ? receiptDto.did : undefined,
                  receipt: receiptDto.receipt,
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
          goalCode: process.env.PHARMACY_DID,
        });

        return outOfBandRecord.id;
      },
    );
    return {
      credentialUrl: `${process.env.SHORT_URL_DOMAIN}/agent/${tenantId}/${oobRecordId}`,
    };
  }
}
