import { Controller, Get, Post } from '@nestjs/common';
import { DoctorService } from 'src/doctor/doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}
  @Get('/agentDetails')
  public getAgentDetails(): string {
    return this.doctorService.getAgentDetails();
  }

  @Get('/getDoctorDetails')
  public async getDoctorDetails(): Promise<string> {
    return this.doctorService.getDoctorDetails();
  }

  @Get('connectionQr')
  public async getConnection(): Promise<object> {
    return this.doctorService.connectionQr();
  }
  // prescribeMedicine
  @Post('prescribeMed')
  public async prescribeMedicine(): Promise<string> {
    return this.doctorService.prescribeMedicine();
  }
}
