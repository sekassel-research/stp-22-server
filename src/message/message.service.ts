import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MessageEvent } from './message.event';
import { Message, MessageDocument } from './message.schema';
import { PutMessageDto } from './put.message.dto';

@Injectable()
export class MessageService {
  private events = new Subject<MessageEvent>();

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
    const document = await this.model.create(message);
    this.events.next({ event: 'created', data: document });
    return document;
  }

  async update(id: string, dto: PutMessageDto): Promise<MessageDocument | undefined> {
    const document = await this.model.findByIdAndUpdate(id, dto).exec();
    if (document) {
      this.events.next({ event: 'updated', data: document });
    }
    return document;
  }

  async delete(id: string): Promise<MessageDocument | undefined> {
    const document = await this.model.findByIdAndDelete(id);
    if (document) {
      this.events.next({ event: 'deleted', data: document });
    }
    return document;
  }

  stream(senderOrReceiver: string): Observable<MessageEvent> {
    return this.events.pipe(
      filter(({ data }) => data.sender === senderOrReceiver || data.receiver === senderOrReceiver),
    );
  }
}
