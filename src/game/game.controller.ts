import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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

  @Post()
  @ApiCreatedResponse({ type: Game })
  create(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.create(createGameDto);
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

  @Put(':id')
  @ApiOkResponse({ type: Game })
  @NotFound()
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto): Promise<Game | undefined> {
    return this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Game })
  @NotFound()
  async delete(@Param('id') id: string): Promise<Game | undefined> {
    return this.gameService.delete(id);
  }
}
