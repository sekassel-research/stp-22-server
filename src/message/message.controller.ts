import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { MemberResolverService } from '../member-resolver/member-resolver.service';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { Message } from './message.schema';
import { MessageService } from './message.service';

@Controller(':namespace/:parent/messages')
@ApiTags('Messages')
@Validated()
@Auth()
@Throttled()
export class MessageController {
  constructor(
    private messageService: MessageService,
    private memberResolver: MemberResolverService,
  ) {
  }

  private async checkParentAndGetMembers(namespace: string, parent: string, user: User): Promise<string[]> {
    const users = await this.memberResolver.resolve(namespace, parent);
    if (!users || users.length === 0) {
      throw new NotFoundException(`${namespace}/${parent}`);
    }
    if (!users.includes(user._id)) {
      throw new ForbiddenException('Cannot access messages within inaccessible parent.');
    }
    return users;
  }

  @Get()
  @ApiOperation({ description: 'Lists the last (limit) messages sent before (createdBefore).' })
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
  @ApiOkResponse({ type: [Message] })
  @ApiNotFoundResponse({ description: 'Namespace or parent not found.' })
  @ApiForbiddenResponse({ description: 'Attempt to read messages in an inaccessible parent.' })
  async getAll(
    @AuthUser() user: User,
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
    await this.checkParentAndGetMembers(namespace, parent, user);
    return this.messageService.findBy(namespace, parent, createdBefore, limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: Message })
  @ApiForbiddenResponse({ description: 'Attempt to read messages in an inaccessible parent.' })
  @NotFound()
  async get(
    @AuthUser() user: User,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Param('id') id: string,
  ): Promise<Message> {
    await this.checkParentAndGetMembers(namespace, parent, user);
    return await this.messageService.find(namespace, parent, id);
  }

  @Post()
  @ApiCreatedResponse({ type: Message })
  @ApiNotFoundResponse({ description: 'Namespace or parent not found.' })
  @ApiForbiddenResponse({ description: 'Attempt to create messages in an inaccessible parent.' })
  async create(
    @AuthUser() user: User,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Body() message: CreateMessageDto,
  ): Promise<Message> {
    const users = await this.checkParentAndGetMembers(namespace, parent, user);
    return this.messageService.create(namespace, parent, user._id, message, users);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Message })
  @ApiForbiddenResponse({ description: 'Attempt to change messages in an inaccessible parent, or to change someone else\'s message.' })
  @NotFound()
  async update(
    @AuthUser() user: User,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<Message> {
    const users = await this.checkParentAndGetMembers(namespace, parent, user);
    const existing = await this.messageService.find(namespace, parent, id);
    if (!existing) {
      return undefined;
    }
    if (existing.sender !== user._id) {
      throw new ForbiddenException('Only the sender can change the message.');
    }
    return this.messageService.update(namespace, parent, id, dto, users);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Message })
  @ApiForbiddenResponse({ description: 'Attempt to delete messages in an inaccessible parent, or to delete someone else\'s message.' })
  @NotFound()
  async delete(
    @AuthUser() user: User,
    @Param('namespace') namespace: string,
    @Param('parent') parent: string,
    @Param('id') id: string,
  ): Promise<Message> {
    const users = await this.checkParentAndGetMembers(namespace, parent, user);
    const existing = await this.messageService.find(namespace, parent, id);
    if (!existing) {
      return undefined;
    }
    if (existing.sender !== user._id) {
      throw new ForbiddenException('Only the sender can delete the message.');
    }
    return this.messageService.delete(namespace, parent, id, users);
  }
}
