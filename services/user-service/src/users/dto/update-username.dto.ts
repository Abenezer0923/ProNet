import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/i, {
    message:
      'Username can only contain letters, numbers, hyphens, and underscores',
  })
  username: string;
}
