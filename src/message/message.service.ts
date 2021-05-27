import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { PutMessageDto } from './put.message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('messages') private model: Model<Message>,
  ) {
  }

  async find(id: string): Promise<MessageDocument | undefined> {
    return this.model.findById(id).exec();
  }

  async findBy(receiver: string): Promise<MessageDocument[]> {
    return this.model.find().where('receiver', receiver).exec();
  }

  async post(message: Message): Promise<MessageDocument> {
    return this.model.create(message);
  }

  async update(id: string, dto: PutMessageDto): Promise<MessageDocument | undefined> {
    return this.model.findByIdAndUpdate(id, dto).exec();
  }

  async delete(id: string): Promise<MessageDocument | undefined> {
    return this.model.findByIdAndDelete(id);
  }
}
