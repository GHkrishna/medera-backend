import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateTenantOptionsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsString()
  connectionImageUrl: string;
}

export class CreateHederaDidOptionsDto {
  @ApiProperty({
    description: 'Enter the tenant id created from the /createTenant',
    example: '4c442fef-b875-42a4-bea4-238168c80d01',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    description:
      'Enter a random 32 characters string, which is used as a seed for didcreation. Note: Use a new seed everytime for creating a did for a same tenant agent',
    example: '00000000000000000000000111111111',
  })
  @IsUrl()
  @IsString()
  seed: string;
}

export class ImportHederaDidOptionsDto {
  @ApiProperty({
    description: 'Enter the tenant id created from the /createTenant',
    example: '4c442fef-b875-42a4-bea4-238168c80d01',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    description: 'Enter the DID hedera created from the /createHederaDid',
    example:
      'did:hedera:testnet:zEcpQ6XxDDP9n2DfLaiaGsQM2z3fW6yr6r5aCcbogUNNb_0.0.5268251',
  })
  @IsString()
  @IsNotEmpty()
  did: string;

  @ApiProperty({
    description:
      'Enter the same did used while creating did in the /createHederaDid',
    example: '00000000000000000000000111111111',
  })
  @IsUrl()
  @IsString()
  seed: string;
}
