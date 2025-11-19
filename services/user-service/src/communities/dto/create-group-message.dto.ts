import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateGroupMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  attachments?: object[];

  @IsOptional()
  @IsString()
  threadId?: string;
}
