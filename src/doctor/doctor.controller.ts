import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DoctorService } from 'src/doctor/doctor.service';
import { PrescriptionDto } from './doctor.dto';

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
  @ApiBody({ type: PrescriptionDto })
  public async prescribeMedicine(
    @Body() prescriptionDto: PrescriptionDto,
  ): Promise<object> {
    return this.doctorService.prescribeMedicine(prescriptionDto);
  }
}
