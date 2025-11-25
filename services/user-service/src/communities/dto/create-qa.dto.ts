import { IsString } from 'class-validator';

export class CreateQADto {
    @IsString()
    question: string;
}
