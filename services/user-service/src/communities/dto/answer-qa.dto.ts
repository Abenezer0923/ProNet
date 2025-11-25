import { IsString } from 'class-validator';

export class AnswerQADto {
    @IsString()
    answer: string;
}
