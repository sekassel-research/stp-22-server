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
import { MemberResolverService } from '../member-resolver/member-resolver.service';
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
    private memberResolver: MemberResolverService,
  ) {
  }

  private async checkParentAndGetMembers(namespace: string, parent: string, request): Promise<string[]> {
    const users = await this.memberResolver.resolve(namespace, parent);
    if (!users || users.length === 0) {
      throw new NotFoundException(`${namespace}/${parent}`);
    }
    if (!users.includes(request.user.id)) {
      throw new UnauthorizedException('Cannot access messages within inaccessible parent.');
    }
    return users;
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
    @Request() request,
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
    await this.checkParentAndGetMembers(namespace, parent, request);
    return this.messageService.findBy(namespace, parent, createdBefore, limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: Message })
  @NotFound()
  async get(
    @Request() request,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Param('id') id: string,
  ): Promise<Message> {
    await this.checkParentAndGetMembers(namespace, parent, request);
    return await this.messageService.find(namespace, parent, id);
  }

  @Post()
  @ApiCreatedResponse({ type: Message })
  @ApiNotFoundResponse({ description: 'Namespace or parent not found.' })
  async create(
    @Request() request,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Body() message: CreateMessageDto,
  ): Promise<Message> {
    const users = await this.checkParentAndGetMembers(namespace, parent, request);
    return this.messageService.create(namespace, parent, request.user.id, message, users);
  }

  @Put(':id')
  @ApiOkResponse({ type: Message })
  @ApiUnauthorizedResponse({ description: 'Attempting to delete someone else\'s message.' })
  @NotFound()
  async update(
    @Request() request,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<Message> {
    const users = await this.checkParentAndGetMembers(namespace, parent, request);
    const existing = await this.messageService.find(namespace, parent, id);
    if (!existing) {
      return undefined;
    }
    if (existing.sender !== request.user.id) {
      throw new UnauthorizedException('Only the sender can change the message.');
    }
    return this.messageService.update(namespace, parent, id, dto, users);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Message })
  @ApiUnauthorizedResponse({ description: 'Attempting to delete someone else\'s message.' })
  @NotFound()
  async delete(
    @Request() request,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Param('id') id: string,
  ): Promise<Message> {
    const users = await this.checkParentAndGetMembers(namespace, parent, request);
    const existing = await this.messageService.find(namespace, parent, id);
    if (!existing) {
      return undefined;
    }
    if (existing.sender !== request.user.id) {
      throw new UnauthorizedException('Only the sender can delete the message.');
    }
    return this.messageService.delete(namespace, parent, id, users);
  }
}
