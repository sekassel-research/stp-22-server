import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateMessageDto, UpdateMessageDto } from './message.dto';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('messages') private model: Model<Message>,
    private eventEmitter: EventEmitter2,
  ) {
  }

  async find(id: string): Promise<MessageDocument | undefined> {
    return this.model.findById(id).exec();
  }

  async findBy(namespace: string, parent: string, createdBefore?: Date, limit?: number): Promise<MessageDocument[]> {
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

  async create(namespace: string, parent: string, sender: string, message: CreateMessageDto): Promise<MessageDocument> {
    const created = await this.model.create({ ...message, namespace, parent, sender });
    created && this.eventEmitter.emit(`${namespace}.${parent}.messages.${created._id}.created`, created);
    return created;
  }

  async update(id: string, dto: UpdateMessageDto): Promise<MessageDocument | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, dto).exec();
    updated && this.eventEmitter.emit(`${updated.namespace}.${updated.parent}.messages.${updated._id}.updated`, updated);
    return updated;
  }

  async delete(id: string): Promise<MessageDocument | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.eventEmitter.emit(`${deleted.namespace}.${deleted.parent}.messages.${deleted._id}.deleted`, deleted);
    return deleted;
  }
}
