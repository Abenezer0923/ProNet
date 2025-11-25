import { IsString } from 'class-validator';

export class VotePollDto {
    @IsString()
    optionId: string;
}
