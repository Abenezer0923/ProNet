import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateOrganizationMediaDto {
  @IsString()
  mediaUrl: string;

  @IsEnum(['image', 'video'])
  mediaType: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
