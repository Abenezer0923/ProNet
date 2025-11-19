import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsEnum(['member', 'moderator', 'admin'])
  role: string;
}
