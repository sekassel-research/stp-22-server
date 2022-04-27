import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { EventService } from '../event/event.service';
import { MemberResolverService, Namespace } from '../member-resolver/member-resolver.service';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('messages') private model: Model<Message>,
    private resolver: MemberResolverService,
    private eventEmitter: EventService,
  ) {
  }

  async find(namespace: Namespace, parent: string, _id: string): Promise<MessageDocument | undefined> {
    return this.model.findOne({ _id, namespace, parent }).exec();
  }

  async findBy(namespace: Namespace, parent: string, createdBefore?: Date, limit?: number): Promise<MessageDocument[]> {
    const filter: FilterQuery<MessageDocument> = {
      namespace,
      parent,
    };
    if (createdBefore) {
      filter.createdAt = { $lt: createdBefore };
    }
    let query = this.model.find(filter).sort('-createdAt');
    if (limit) {
      query = query.limit(limit);
    }
    const messages = await query.exec();
    messages.reverse();
    return messages;
  }

  async create(namespace: Namespace, parent: string, sender: string, message: CreateMessageDto, users: string[]): Promise<MessageDocument> {
    const created = await this.model.create({ ...message, namespace, parent, sender });
    created && this.sendEvent('created', created, users);
    return created;
  }

  async update(namespace: Namespace, parent: string, _id: string, dto: UpdateMessageDto, users: string[]): Promise<MessageDocument | undefined> {
    const updated = await this.model.findOneAndUpdate({ namespace, parent, _id }, dto, { new: true }).exec();
    updated && this.sendEvent('updated', updated, users);
    return updated;
  }

  async delete(namespace: Namespace, parent: string, _id: string, users: string[]): Promise<MessageDocument | undefined> {
    const deleted = await this.model.findOneAndDelete({ namespace, parent, _id }).exec();
    deleted && this.sendEvent('deleted', deleted, users);
    return deleted;
  }

  async deleteAll(namespace: Namespace, parent: string, users: string[]): Promise<MessageDocument[]> {
    const messages = await this.findBy(namespace, parent);
    for (const message of messages) {
      this.sendEvent('deleted', message, users);
    }
    await this.model.deleteMany({ namespace, parent }).exec();
    return messages;
  }

  private sendEvent(event: string, message: Message, users: string[]): void {
    this.eventEmitter.emit(`${message.namespace}.${message.parent}.messages.${message._id}.${event}`, message, users);
  }
}
