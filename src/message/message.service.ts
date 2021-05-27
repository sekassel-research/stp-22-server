import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('messages') private model: Model<Message>,
  ) {
  }

  async findBy(receiver: string): Promise<MessageDocument[]> {
    return this.model.find().where('receiver', receiver).exec();
  }

  async post(message: Message): Promise<MessageDocument> {
    return this.model.create(message);
  }
}
