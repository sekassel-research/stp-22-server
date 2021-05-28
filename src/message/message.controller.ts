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
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateMessageDto, PutMessageDto } from './message.dto';
import { Message } from './message.schema';
import { MessageService } from './message.service';

@Controller('messages')
@ApiTags('Messages')
@UsePipes(ValidationPipe)
export class MessageController {
  constructor(
    private messageService: MessageService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Message] })
  async getAll(@Query('receiver') receiver: string): Promise<Message[]> {
    return this.messageService.findBy(receiver);
  }

  @Get(':id')
  @ApiOkResponse({ type: Message })
  @ApiNotFoundResponse()
  async get(@Param('id') id: string): Promise<Message> {
    const message = await this.messageService.find(id);
    if (!message) {
      throw new NotFoundException(id);
    }
    return message;
  }

  @Post()
  @ApiCreatedResponse({ type: Message })
  async post(@Body() message: CreateMessageDto): Promise<Message> {
    return this.messageService.post(message);
  }

  @Put(':id')
  @ApiOkResponse({ type: Message })
  @ApiNotFoundResponse()
  async put(@Param('id') id: string, @Body() dto: PutMessageDto): Promise<Message> {
    const message = await this.messageService.update(id, dto);
    if (!message) {
      throw new NotFoundException(id);
    }
    return message;
  }

  @Delete(':id')
  @ApiOkResponse({ type: Message })
  @ApiNotFoundResponse()
  async delete(@Param('id') id: string): Promise<Message> {
    const message = await this.messageService.delete(id);
    if (!message) {
      throw new NotFoundException(id);
    }
    return message;
  }
}
