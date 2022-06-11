import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { FilterQuery, Model } from 'mongoose';
import { EventService } from '../event/event.service';
import { User } from '../user/user.schema';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { Game } from './game.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel('games') private model: Model<Game>,
    private eventService: EventService,
  ) {
  }

  private async hash(dto: UpdateGameDto): Promise<Partial<Game>> {
    const { password, ...rest } = dto;
    const result: Partial<Game> = rest;
    if (password) {
      const passwordSalt = await bcrypt.genSalt();
      result.passwordHash = await bcrypt.hash(password, passwordSalt);
    }
    return result;
  }

  async create(owner: User, game: CreateGameDto): Promise<Game> {
    const created = await this.model.create(await this.hash({ ...game, owner: owner._id.toString() }));
    created && this.emit('created', created);
    return created;
  }

  async findAll(filter: FilterQuery<Game> = {}): Promise<Game[]> {
    return this.model.find(filter).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Game | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateGameDto): Promise<Game | null> {
    const updated = await this.model.findByIdAndUpdate(id, await this.hash(dto), { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async changeMembers(id: string, delta: number): Promise<Game | null> {
    const updated = await this.model.findByIdAndUpdate(id, { $inc: { members: delta } }, { new: true });
    updated && this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<Game | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  async deleteMany(filter?: FilterQuery<Game>): Promise<Game[]> {
    const games = await this.findAll(filter);
    await this.model.deleteMany({ _id: { $in: games.map(g => g._id) } });
    for (const game of games) {
      this.emit('deleted', game);
    }
    return games;
  }

  private emit(event: string, game: Game): void {
    this.eventService.emit(`games.${game._id}.${event}`, game);
  }
}
