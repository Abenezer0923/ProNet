import { IsString, IsArray, IsBoolean, IsOptional, ArrayMinSize } from 'class-validator';

export class CreatePollDto {
    @IsString()
    question: string;

    @IsArray()
    @ArrayMinSize(2)
    @IsString({ each: true })
    options: string[];

    @IsOptional()
    @IsBoolean()
    allowMultiple?: boolean;

    @IsOptional()
    @IsBoolean()
    anonymous?: boolean;
}
