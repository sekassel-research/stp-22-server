import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MemberResolverService } from '../member-resolver/member-resolver.service';
import { MessageService } from './message.service';

@Injectable()
export class MessageHandler {
  constructor(
    private messageService: MessageService,
    private memberResolver: MemberResolverService,
  ) {
  }

  @OnEvent('*.*.deleted')
  async onDeleted(entity: any): Promise<void> {
    const resolved = await this.memberResolver.resolveFrom(entity);
    if (resolved) {
      await this.messageService.deleteAll(resolved[0], entity._id, resolved[1]);
    }
  }
}
