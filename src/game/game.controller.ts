import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { Game } from './game.schema';
import { GameService } from './game.service';

@Controller('games')
@ApiTags('Games')
@UsePipes(ValidationPipe)
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
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string): Promise<Game | undefined> {
    return this.gameService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: Game })
  async create(@Request() request, @Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.create(request.user, createGameDto);
  }

  @Put(':id')
  @ApiOkResponse({ type: Game })
  @NotFound()
  @ApiUnauthorizedResponse()
  async update(@Param('id') id: string, @Request() request, @Body() updateGameDto: UpdateGameDto): Promise<Game | undefined> {
    const existing = await this.gameService.findOne(id);
    if (!existing) {
      throw new NotFoundException(id);
    }
    if (existing.owner !== request.user.id) {
      throw new UnauthorizedException('Only the owner can change the game.');
    }
    return this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Game })
  @NotFound()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token, or attempting to delete a game that the current user does not own.' })
  async delete(@Param('id') id: string, @Request() request): Promise<Game | undefined> {
    const existing = await this.gameService.findOne(id);
    if (!existing) {
      throw new NotFoundException(id);
    }
    if (existing.owner !== request.user.id) {
      throw new UnauthorizedException('Only the owner can delete the game.');
    }
    return this.gameService.delete(id);
  }
}
