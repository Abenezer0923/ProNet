import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsUUID()
  @IsOptional()
  actorId?: string;

  @IsUUID()
  @IsOptional()
  relatedId?: string;
}
