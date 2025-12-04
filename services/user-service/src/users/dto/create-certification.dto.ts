import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  name: string;

  @IsString()
  issuingOrganization: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsString()
  credentialUrl?: string;

  @IsOptional()
  @IsBoolean()
  doesNotExpire?: boolean;
}
