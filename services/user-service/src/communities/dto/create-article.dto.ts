import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: string;
}
