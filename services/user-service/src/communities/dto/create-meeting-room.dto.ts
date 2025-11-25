import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsObject, Min, Max } from 'class-validator';

export class CreateMeetingRoomDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    scheduledStartTime?: string;

    @IsOptional()
    @IsDateString()
    scheduledEndTime?: string;

    @IsOptional()
    @IsNumber()
    @Min(2)
    @Max(100)
    maxParticipants?: number;

    @IsOptional()
    @IsBoolean()
    enableRecording?: boolean;

    @IsOptional()
    @IsBoolean()
    enableScreenShare?: boolean;

    @IsOptional()
    @IsBoolean()
    enableChat?: boolean;

    @IsOptional()
    @IsBoolean()
    enableBreakoutRooms?: boolean;

    @IsOptional()
    @IsObject()
    settings?: {
        waitingRoom?: boolean;
        muteOnEntry?: boolean;
        videoOnEntry?: boolean;
        allowUnmute?: boolean;
        recordingLayout?: 'grid' | 'speaker' | 'presentation';
    };
}
