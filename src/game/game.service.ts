import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { Game } from './game.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GameService {
  constructor(
    @InjectModel('games') private model: Model<Game>,
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
    return this.model.create(await this.hash(game));
  }

  async findAll(): Promise<Game[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Game | undefined> {
    return this.model.findById(id).exec();
  }

  async update(id: string, game: UpdateGameDto): Promise<Game | undefined> {
    return this.model.findByIdAndUpdate(id, await this.hash(game)).exec();
  }

  async delete(id: string): Promise<Game | undefined> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
