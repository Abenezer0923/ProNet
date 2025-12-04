import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsOptional()
  @MaxLength(4000)
  coverLetter?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @IsUrl({ require_protocol: false }, { message: 'resumeUrl must be a valid URL' })
  resumeUrl?: string;
}
