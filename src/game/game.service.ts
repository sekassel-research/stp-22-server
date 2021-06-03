import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
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

  private async hash(owner: string, dto: CreateGameDto | UpdateGameDto) {
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    return {
      owner,
      ...dto,
      password: undefined,
      passwordHash,
    };
  }

  async create(owner: User, game: CreateGameDto): Promise<Game> {
    const created = await this.model.create(await this.hash(owner._id, game));
    created && this.eventEmitter.emit(`games.${created._id}.created`, created);
    return created;
  }

  async findAll(): Promise<Game[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Game | undefined> {
    return this.model.findById(id).exec();
  }

  async update(id: string, game: UpdateGameDto): Promise<Game | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, await this.hash(game.owner, game)).exec();
    updated && this.eventEmitter.emit(`games.${id}.updated`, updated);
    return updated;
  }

  async changeMembers(id: string, delta: number): Promise<Game | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, { $inc: { members: delta } });
    updated && this.eventEmitter.emit(`games.${id}.updated`, updated);
    return updated;
  }

  async delete(id: string): Promise<Game | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.eventEmitter.emit(`games.${id}.deleted`, deleted);
    return deleted;
  }

  async deleteEmptyGames(olderThanMs: number): Promise<Game[]> {
    const filterDate = new Date(Date.now() - olderThanMs);
    const games = await this.model.find({
      updatedAt: { $lt: filterDate },
      members: 0,
    }).exec();
    await this.model.deleteMany({ _id: { $in: games.map(g => g._id) } });
    for (const game of games) {
      this.eventEmitter.emit(`games.${game._id}.deleted`, game);
    }
    return games;
  }
}
