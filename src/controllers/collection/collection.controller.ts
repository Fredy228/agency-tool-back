import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { ImageValidatorPipe } from '../../pipe/validator-img.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { User } from '../../entity/user.entity';
import { CollectionDto } from './collection.dto';
import { collectionCreateSchema } from '../../joi-schema/collectionSchema';

@Controller('api/collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('/:idDashboard')
  @HttpCode(201)
  @UsePipes(
    new BodyValidationPipe(collectionCreateSchema),
    new ImageValidatorPipe({ maxSize: 5 }),
  )
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async create(
    @Param('idDashboard') idDashboard: string,
    @Req() req: Request & { user: User },
    @UploadedFiles()
    files: {
      image?: Array<Express.Multer.File>;
    },
    @Body() body: CollectionDto,
  ) {
    return this.collectionService.createCollection(
      req.user,
      body,
      Number(idDashboard),
      files?.image[0],
    );
  }
}
