import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Message, MessageDocument } from './message.schema';
import { MessageService } from './message.service';

@Controller('messages')
@UsePipes(ValidationPipe)
export class MessageController {
  constructor(
    private messageService: MessageService,
  ) {
  }

  @Get()
  async getAll(@Query('receiver') receiver: string): Promise<MessageDocument[]> {
    return this.messageService.findBy(receiver);
  }

  @Post()
  async post(@Body() message: Message): Promise<MessageDocument> {
    return this.messageService.post(message);
  }
}
