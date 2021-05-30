import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { Throttled } from '../throttled.decorator';
import { NotFound } from '../util/not-found.decorator';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { Message } from './message.schema';
import { MessageService } from './message.service';

@Controller('messages')
@ApiTags('Messages')
@UsePipes(ValidationPipe)
@Auth()
@Throttled()
export class MessageController {
  constructor(
    private messageService: MessageService,
  ) {
  }

  @Get()
  @ApiOperation({ description: 'Lists the last (limit) messages sent between (between) and (and) before (createdBefore).' })
  @ApiOkResponse({ type: [Message] })
  @ApiQuery({
    name: 'between',
    description: 'The expected primary chat partner of the message',
  })
  @ApiQuery({
    name: 'and',
    description: 'The expected secondary chat partner of the message',
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
    @Query('between') chatPartnerA: string,
    @Query('and') chatPartnerB: string,
    @Query('createdBefore') createdBefore?: Date,
    @Query('limit') limit = 100,
  ): Promise<Message[]> {
    limit = +limit;
    if (limit < 1) {
      limit = 1;
    }
    if (limit > 100) {
      limit = 100;
    }
    return this.messageService.findBy(chatPartnerA, chatPartnerB, createdBefore, limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: Message })
  @NotFound()
  async get(@Param('id') id: string): Promise<Message> {
    return this.messageService.find(id);
  }

  @Post()
  @ApiCreatedResponse({ type: Message })
  async create(@Body() message: CreateMessageDto): Promise<Message> {
    return this.messageService.create(message);
  }

  @Put(':id')
  @ApiOkResponse({ type: Message })
  @NotFound()
  async update(@Param('id') id: string, @Body() dto: UpdateMessageDto): Promise<Message> {
    return this.messageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Message })
  @NotFound()
  async delete(@Param('id') id: string): Promise<Message> {
    return this.messageService.delete(id);
  }
}
