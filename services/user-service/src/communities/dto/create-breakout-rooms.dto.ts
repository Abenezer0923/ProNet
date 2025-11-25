import { IsString, IsArray, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBreakoutRoomsDto {
    @IsNumber()
    @Min(2)
    numberOfRooms: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    assignmentType?: 'auto' | 'manual';

    @IsOptional()
    @IsArray()
    roomAssignments?: {
        roomName: string;
        participantIds: string[];
    }[];
}
