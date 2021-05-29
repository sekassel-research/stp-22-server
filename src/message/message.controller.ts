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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
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
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
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
  async create(@Body() message: CreateMessageDto): Promise<Message> {
    return this.messageService.create(message);
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
