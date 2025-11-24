import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsString()
  @IsOptional()
  visibility?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
