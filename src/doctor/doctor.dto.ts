import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class PrescriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  prescription: string;

  @ApiProperty()
  @IsNotEmpty()
  patientDetails: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  did?: string;
}

export class PatientDetails {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  connectionIds: string[];
}
