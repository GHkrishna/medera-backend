import { Body, Controller, Get, Post } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { ApiBody } from '@nestjs/swagger';
import { PatientDetails, ReceiptDto } from './pharmacy.dto';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private pharmacyService: PharmacyService) {}
  @Get('/agentDetails')
  public getAgentDetails(): string {
    return this.pharmacyService.getAgentDetails();
  }

  @Get('/getPharmacyDetails')
  public async getPharmacyDetails(): Promise<string> {
    return this.pharmacyService.getPharmacyDetails();
  }

  @Get('connectionQr')
  public async getConnection(): Promise<object> {
    return this.pharmacyService.connectionQr();
  }

  @Get('patientList')
  public async getConnectionList(): Promise<object> {
    return this.pharmacyService.getConnectionList();
  }

  @Post('receiptDetailsByPatient')
  @ApiBody({ type: PatientDetails })
  public async getCredentialByPatient(
    @Body() patientConnectionIds: PatientDetails,
  ): Promise<object> {
    return this.pharmacyService.getCredentialByPatient(patientConnectionIds);
  }

  @Get('verifiedPrescreptionDetails')
  public async getVerifiedPrescreptionDetails(): Promise<any> {
    return this.pharmacyService.getVerifiedPrescreptionDetails();
  }

  // provideReceipt
  @Post('provideReceipt')
  @ApiBody({ type: ReceiptDto })
  public async provideReceipt(
    @Body() prescriptionDto: ReceiptDto,
  ): Promise<object> {
    return this.pharmacyService.provideReceipt(prescriptionDto);
  }
}
