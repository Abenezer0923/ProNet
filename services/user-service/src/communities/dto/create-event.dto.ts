import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['webinar', 'workshop', 'meeting', 'networking', 'social'])
  type: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsNumber()
  maxAttendees?: number;

  @IsOptional()
  @IsString()
  coverImage?: string;
}
