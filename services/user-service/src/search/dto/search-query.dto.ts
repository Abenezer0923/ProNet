import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchType {
  ALL = 'all',
  USERS = 'users',
  COMMUNITIES = 'communities',
  POSTS = 'posts',
}

export class SearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class UserSearchDto extends SearchQueryDto {
  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}

export class CommunitySearchDto extends SearchQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minMembers?: number;
}

export class PostSearchDto extends SearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  communityId?: number;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
