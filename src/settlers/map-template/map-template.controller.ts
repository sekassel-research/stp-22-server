import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { CreateMapTemplateDto, UpdateMapTemplateDto } from './map-template.dto';
import { MapTemplate } from './map-template.schema';
import { MapTemplateService } from './map-template.service';

@Controller('maps')
@ApiTags('Map Templates')
@Validated()
@Auth()
@Throttled()
export class MapTemplateController {
  constructor(
    private mapTemplateService: MapTemplateService,
  ) {
  }

  @Get()
  @ApiQuery({ name: 'createdBy', description: 'Filter by creator user ID.', required: false })
  @ApiOkResponse({ type: [MapTemplate] })
  async findAll(@Query('createdBy') createdBy?: string): Promise<MapTemplate[]> {
    return this.mapTemplateService.findAll({ createdBy });
  }

  @Get(':id')
  @ApiOkResponse({ type: MapTemplate })
  @NotFound()
  async findOne(@Param('id') id: string): Promise<MapTemplate | undefined> {
    return this.mapTemplateService.find(id);
  }

  @Post()
  @ApiCreatedResponse({ type: MapTemplate })
  async create(@AuthUser() user: User, @Body() dto: CreateMapTemplateDto): Promise<MapTemplate> {
    return this.mapTemplateService.create(user._id, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MapTemplate })
  @ApiForbiddenResponse({ description: 'Attempt to change a map that was not created by the current user.' })
  @NotFound()
  async update(@AuthUser() user: User, @Param('id') id: string, @Body() dto: UpdateMapTemplateDto): Promise<MapTemplate | undefined> {
    const existing = await this.mapTemplateService.find(id);
    if (!existing) {
      return undefined;
    }
    this.checkOwner(existing, user);
    return this.mapTemplateService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: MapTemplate })
  @ApiForbiddenResponse({ description: 'Attempt to delete a map that was not created by the current user.' })
  @NotFound()
  async delete(@AuthUser() user: User, @Param('id') id: string): Promise<MapTemplate | undefined> {
    const existing = await this.mapTemplateService.find(id);
    if (!existing) {
      return undefined;
    }
    this.checkOwner(existing, user);
    return this.mapTemplateService.delete(id);
  }

  private checkOwner(template: MapTemplate, user: User) {
    if (template.createdBy !== user._id) {
      throw new ForbiddenException('You are not the creator of this map.');
    }
  }
}
