import { IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  participantId: string;
}
