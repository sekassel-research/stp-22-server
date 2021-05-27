import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Message, MessageDocument } from './message.schema';
import { MessageService } from './message.service';
import { PutMessageDto } from './put.message.dto';

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

  @Get(':id')
  async get(@Param('id') id: string): Promise<MessageDocument> {
    const message = await this.messageService.find(id);
    if (!message) {
      throw new NotFoundException(id);
    }
    return message;
  }

  @Post()
  async post(@Body() message: Message): Promise<MessageDocument> {
    return this.messageService.post(message);
  }

  @Put(':id')
  async put(@Param('id') id: string, @Body() dto: PutMessageDto): Promise<MessageDocument> {
    const message = await this.messageService.update(id, dto);
    if (!message) {
      throw new NotFoundException(id);
    }
    return message;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<MessageDocument> {
    const message = await this.messageService.delete(id);
    if (!message) {
      throw new NotFoundException(id);
    }
    return message;
  }
}
