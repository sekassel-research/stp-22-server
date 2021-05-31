import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { Game } from './game.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel('games') private model: Model<Game>,
  ) {
  }

  async create(game: CreateGameDto): Promise<Game> {
    return this.model.create(game);
  }

  async findAll(): Promise<Game[]> {
    return this.model.find().sort('+name').exec();
  }

  async findOne(id: string): Promise<Game | undefined> {
    return this.model.findById(id).exec();
  }

  async update(id: string, game: UpdateGameDto): Promise<Game | undefined> {
    return this.model.findByIdAndUpdate(id, game).exec();
  }

  async delete(id: string): Promise<Game | undefined> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
