import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ description: 'Lists the last (limit) messages sent to the (receiver) before (createdBefore).' })
  @ApiOkResponse({ type: [Message] })
  @ApiQuery({
    name: 'receiver',
    description: 'The expected receiver of the message',
  })
  @ApiQuery({
    name: 'createdBefore',
    description: 'The timestamp before which messages are requested',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'The maximum number of results',
    required: false,
    schema: { minimum: 1, maximum: 100, type: 'number', default: 100 },
  })
  async getAll(
    @Query('receiver') receiver: string,
    @Query('createdBefore') createdBefore?: Date,
    @Query('limit', ParseIntPipe) limit = 100,
  ): Promise<Message[]> {
    if (limit < 1) {
      limit = 1;
    }
    if (limit > 100) {
      limit = 100;
    }
    return this.messageService.findBy(receiver, createdBefore, limit);
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
