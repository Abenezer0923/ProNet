import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.createOrGetConversation(
      req.user.sub,
      createConversationDto,
    );
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.sub);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Request() req, @Param('id') id: string) {
    return this.chatService.getConversationMessages(id, req.user.sub);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.sub);
  }

  @Put('conversations/:id/read')
  async markConversationAsRead(@Request() req, @Param('id') id: string) {
    return this.chatService.markConversationAsRead(id, req.user.sub);
  }

  @Put('messages/:id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.chatService.markAsRead(id, req.user.sub);
  }
}
