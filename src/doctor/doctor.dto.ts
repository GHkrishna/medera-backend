import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class PrescriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  prescription: string;

  @ApiProperty()
  @IsNotEmpty()
  patientDetails: string;
}

export class PatientDetails {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  connectionIds: string[];
}
