import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['chat', 'mentorship', 'meeting', 'announcement'])
  type: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(['public', 'private', 'members-only'])
  privacy: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
