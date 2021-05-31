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

  async findBy(chatPartnerA: string, chatPartnerB: string, createdBefore?: Date, limit?: number): Promise<MessageDocument[]> {
    const filter: FilterQuery<MessageDocument> = {
      $or: [
        { sender: chatPartnerA, receiver: chatPartnerB },
        { sender: chatPartnerB, receiver: chatPartnerA },
      ],
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

  async create(message: CreateMessageDto): Promise<MessageDocument> {
    const created = await this.model.create(message);
    created && this.eventEmitter.emit('message.created', created);
    return created;
  }

  async update(id: string, dto: UpdateMessageDto): Promise<MessageDocument | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, dto).exec();
    updated && this.eventEmitter.emit('message.updated', updated);
    return updated;
  }

  async delete(id: string): Promise<MessageDocument | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.eventEmitter.emit('message.deleted', deleted);
    return deleted;
  }
}
