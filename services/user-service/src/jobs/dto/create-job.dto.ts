import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'internship',
  'freelance',
] as const;

export const WORKPLACE_TYPES = ['onsite', 'remote', 'hybrid'] as const;

export class CreateJobDto {
  @IsString()
  @MaxLength(180)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsIn(EMPLOYMENT_TYPES as readonly string[])
  employmentType: string;

  @IsString()
  @IsIn(WORKPLACE_TYPES as readonly string[])
  workplaceType: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  salaryCurrency?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : value))
  salaryMin?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : value))
  salaryMax?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  experienceLevel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  seniority?: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean)
      : value,
  )
  responsibilities?: string[];

  @IsArray()
  @ArrayMaxSize(20)
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean)
      : value,
  )
  requirements?: string[];

  @IsArray()
  @ArrayMaxSize(20)
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean)
      : value,
  )
  benefits?: string[];

  @IsUrl({ require_protocol: false }, { message: 'applicationUrl must be a valid URL' })
  @IsOptional()
  @MaxLength(500)
  applicationUrl?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  contactEmail?: string;

  @IsDateString()
  @IsOptional()
  applicationDeadline?: string;
}
