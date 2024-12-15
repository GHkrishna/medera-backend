import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ReceiptDto {
  @ApiProperty()
  @IsNotEmpty()
  receipt: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  did?: string;
}

export class PatientDetails {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  connectionId: string;
}
