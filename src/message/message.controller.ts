import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { Message } from './message.schema';
import { MessageService } from './message.service';

@Controller(':namespace/:parent/messages')
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
  @ApiOperation({ description: 'Lists the last (limit) messages sent before (createdBefore).' })
  @ApiOkResponse({ type: [Message] })
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
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
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
    return this.messageService.findBy(namespace, parent, createdBefore, limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: Message })
  @NotFound()
  async get(@Param('id') id: string): Promise<Message> {
    return this.messageService.find(id);
  }

  @Post()
  @ApiCreatedResponse({ type: Message })
  @ApiNotFoundResponse({ description: 'Namespace or parent not found.' })
  async create(
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Request() request,
    @Body() message: CreateMessageDto,
  ): Promise<Message> {
    return this.messageService.create(namespace, parent, request.user.id, message);
  }

  @Put(':id')
  @ApiOkResponse({ type: Message })
  @ApiUnauthorizedResponse({ description: 'Attempting to delete someone else\'s message.' })
  @NotFound()
  async update(@Request() request, @Param('id') id: string, @Body() dto: UpdateMessageDto): Promise<Message> {
    const existing = await this.messageService.find(id);
    if (!existing) {
      return undefined;
    }
    if (existing.sender !== request.user.id) {
      throw new UnauthorizedException('Only the sender can change the message.');
    }
    return this.messageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Message })
  @ApiUnauthorizedResponse({ description: 'Attempting to delete someone else\'s message.' })
  @NotFound()
  async delete(@Request() request, @Param('id') id: string): Promise<Message> {
    const existing = await this.messageService.find(id);
    if (!existing) {
      return undefined;
    }
    if (existing.sender !== request.user.id) {
      throw new UnauthorizedException('Only the sender can delete the message.');
    }
    return this.messageService.delete(id);
  }
}
