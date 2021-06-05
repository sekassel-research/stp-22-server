import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { RefreshToken } from '../auth/auth.interface';
import { JwtStrategy } from '../auth/jwt.strategy';
import { environment } from '../environment';
import { CreateUserDto, LoginDto, LoginResult, RefreshDto, UpdateUserDto } from './user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  private online = new Set<string>();

  constructor(
    @InjectModel('users') private model: Model<User>,
    private eventEmitter: EventEmitter2,
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
  ) {
  }

  async findAll(ids?: string[]): Promise<User[]> {
    return (ids ? this.model.find({ _id: { $in: ids } }) : this.model.find())
      .sort({ name: 1 })
      .exec();
  }

  async findOnline(): Promise<User[]> {
    return this.findAll([...this.online]);
  }

  async find(id: string): Promise<User | undefined> {
    return this.model.findById(id).exec();
  }

  async findByName(name: string): Promise<User | undefined> {
    return this.model.findOne({ name }).exec();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByName(dto.name);
    if (existing) {
      return existing;
    }

    const created = await this.model.create(await this.hash(dto));
    created && this.emit('created', created);
    return created;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, await this.hash(dto)).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<User | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private async hash(dto: CreateUserDto) {
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    return {
      ...dto,
      password: undefined,
      passwordHash,
    };
  }

  async login({ name, password }: LoginDto): Promise<LoginResult | undefined> {
    const user = await this.findByName(name);
    if (!user) {
      return undefined;
    }

    const passwordMatch = bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return undefined;
    }

    let refreshKey = user.refreshKey;
    if (!refreshKey) {
      refreshKey = crypto.randomBytes(64).toString('base64');
      await this.model.findByIdAndUpdate(user._id, { refreshKey }).exec();
    }

    this.online.add(user._id);
    this.emit('online', user);

    const accessPayload = await this.jwtStrategy.generate(user);
    const refreshPayload: RefreshToken = { sub: user._id, refreshKey };
    return {
      ...(user as UserDocument).toObject(),
      accessToken: this.jwtService.sign(accessPayload),
      refreshToken: this.jwtService.sign(refreshPayload, {
        expiresIn: environment.auth.refreshExpiry,
      }),
    };
  }

  async refresh(dto: RefreshDto): Promise<LoginResult | undefined> {
    const refreshToken = this.jwtService.decode(dto.refreshToken) as RefreshToken | null;
    if (!refreshToken) {
      return undefined;
    }
    const { sub: userId, refreshKey } = refreshToken;
    const user = await this.model.findOne({ _id: userId, refreshKey }).exec();
    if (!user) {
      return undefined;
    }

    const payload = await this.jwtStrategy.generate(user);
    return {
      ...(user as UserDocument).toObject(),
      accessToken: this.jwtService.sign(payload),
      refreshToken: dto.refreshToken,
    };
  }

  async logout(user: User) {
    this.online.delete(user._id);
    this.emit('offline', user);
  }

  private emit(event: string, user: User) {
    this.eventEmitter.emit(`users.${user._id}.${event}`, user);
  }
}
