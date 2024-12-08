import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PrescriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  prescription: string;

  @ApiProperty()
  @IsNotEmpty()
  patientDetails: string;
}
