import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth, AuthUser, DEFAULT_DESCRIPTION } from '../auth/auth.decorator';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { Game } from './game.schema';
import { GameService } from './game.service';

@Controller('games')
@ApiTags('Games')
@Validated()
@Auth()
@Throttled()
export class GameController {
  constructor(
    private readonly gameService: GameService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Game] })
  async findAll(): Promise<Game[]> {
    return this.gameService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Game })
  @NotFound()
  async findOne(@Param('id') id: string): Promise<Game | undefined> {
    return this.gameService.findOne(id);
  }

  @Post()
  @ApiOperation({ description: 'Create a game. The current user becomes the owner and is automatically added as a member.' })
  @ApiCreatedResponse({ type: Game })
  async create(@AuthUser() user: User, @Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.create(user, createGameDto);
  }

  @Put(':id')
  @NotFound()
  @ApiOperation({ description: 'Change a game as owner.' })
  @ApiOkResponse({ type: Game })
  @ApiUnauthorizedResponse({ description: `${DEFAULT_DESCRIPTION}, or attempting to change a game that the current user does not own.` })
  async update(@AuthUser() user: User, @Param('id') id: string, @Body() updateGameDto: UpdateGameDto): Promise<Game | undefined> {
    const existing = await this.gameService.findOne(id);
    if (!existing) {
      throw new NotFoundException(id);
    }
    if (existing.owner !== user._id) {
      throw new UnauthorizedException('Only the owner can change the game.');
    }
    // FIXME this allows changing the owner to someone who is not a member!
    return this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  @NotFound()
  @ApiOperation({ description: 'Delete a game as owner. All members will be automatically kicked.' })
  @ApiOkResponse({ type: Game })
  @ApiUnauthorizedResponse({ description: `${DEFAULT_DESCRIPTION}, or attempting to delete a game that the current user does not own.` })
  async delete(@AuthUser() user: User, @Param('id') id: string): Promise<Game | undefined> {
    const existing = await this.gameService.findOne(id);
    if (!existing) {
      throw new NotFoundException(id);
    }
    if (existing.owner !== user._id) {
      throw new UnauthorizedException('Only the owner can delete the game.');
    }
    return this.gameService.delete(id);
  }
}
