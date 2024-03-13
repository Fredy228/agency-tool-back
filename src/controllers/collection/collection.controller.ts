import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { Request } from 'express';
import { User } from '../../entity/user.entity';
import { CollectionDto } from './collection.dto';
import { collectionCreateSchema } from '../../joi-schema/collectionSchema';

@Controller('api/collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('/:idDashboard')
  @HttpCode(201)
  @UsePipes(new BodyValidationPipe(collectionCreateSchema))
  async create(
    @Param('idDashboard') idDashboard: string,
    @Req() req: Request & { user: User },
    @Body() body: CollectionDto,
  ) {
    return this.collectionService.createCollection(
      req.user,
      body,
      Number(idDashboard),
    );
  }

  @Patch('/:idCollection')
  @HttpCode(204)
  async update(
    @Param('idCollection') idCollection: string,
    @Req() req: Request & { user: User },
    @Body() body: Partial<CollectionDto>,
  ) {
    return this.collectionService.updateCollection(
      req.user,
      Number(idCollection),
      body,
    );
  }

  @Get('/:idCollection')
  @HttpCode(200)
  async getById(
    @Param('idCollection') idCollection: string,
    @Query() query: { password: string },
    @Req() req: Request & { user: User },
  ) {
    return this.collectionService.getCollectionById(
      req.user,
      Number(idCollection),
      query.password,
    );
  }

  @Delete('/:idCollection')
  @HttpCode(204)
  async delete(
    @Param('idCollection') idCollection: string,
    @Req() req: Request & { user: User },
  ) {
    return this.collectionService.deleteCollection(
      req.user,
      Number(idCollection),
    );
  }
}
