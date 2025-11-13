import { IsString, IsOptional, IsIn } from 'class-validator';

export class AddSkillDto {
  @IsString()
  skillName: string;

  @IsString()
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'expert'])
  proficiencyLevel?: string;
}
