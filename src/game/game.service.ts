import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { Game } from './game.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GameService {
  constructor(
    @InjectModel('games') private model: Model<Game>,
    private eventEmitter: EventEmitter2,
  ) {
  }

  private async hash(dto: CreateGameDto | UpdateGameDto) {
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    return {
      ...dto,
      password: undefined,
      passwordSalt,
      passwordHash,
    };
  }

  async create(game: CreateGameDto): Promise<Game> {
    const created = await this.model.create(await this.hash(game));
    created && this.eventEmitter.emit('game.created', created);
    return created;
  }

  async findAll(): Promise<Game[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Game | undefined> {
    return this.model.findById(id).exec();
  }

  async update(id: string, game: UpdateGameDto): Promise<Game | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, await this.hash(game)).exec();
    updated && this.eventEmitter.emit('game.updated', updated);
    return updated;
  }

  async delete(id: string): Promise<Game | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.eventEmitter.emit('game.deleted', deleted);
    return deleted;
  }
}
