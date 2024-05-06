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
import {
  collectionCreateSchema,
  collectionUpdateSchema,
} from '../../joi-schema/collectionSchema';

import { load } from 'cheerio';
import axios from 'axios';

@Controller('api/collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('/cheerio')
  @HttpCode(200)
  async cheerio(@Body() body: { url: string }) {
    const { data } = await axios.get(body.url);
    const $ = load(data);
    const getMetaTag = (name) => {
      return (
        $(`meta[name=${name}]`).attr('content') ||
        $(`meta[propety="twitter${name}"]`).attr('content') ||
        $(`meta[property="og:${name}"]`).attr('content')
      );
    };
    const preview = {
      url: body.url,
      title: $('title').first().text(),
      favicon:
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="alternate icon"]').attr('href'),
      description: getMetaTag('description'),
      image: getMetaTag('image'),
      author: getMetaTag('author'),
    };

    console.log(preview);
    return preview;
  }

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
  @HttpCode(200)
  @UsePipes(new BodyValidationPipe(collectionUpdateSchema))
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
