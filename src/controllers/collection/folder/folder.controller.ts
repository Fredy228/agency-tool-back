import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../../entity/user.entity';
import { FolderService } from './folder.service';

@Controller('api/collection/section')
export class SectionController {
  constructor(private readonly serviceFolder: FolderService) {}

  @Post('/:idSection')
  @HttpCode(201)
  async create(
    @Param('idSection') idSection: string,
    @Req() req: Request & { user: User },
    @Body() { name }: { name: string },
  ) {
    return this.serviceFolder.create(req.user, Number(idSection), name);
  }

  @Patch('/:idFolder')
  @HttpCode(204)
  async update(
    @Param('idFolder') idFolder: string,
    @Req() req: Request & { user: User },
    @Body() { name }: { name: string },
  ) {
    return this.serviceFolder.update(req.user, Number(idFolder), name);
  }

  @Delete(':idFolder')
  @HttpCode(204)
  async delete(
    @Param('idFolder') idFolder: string,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceFolder.delete(req.user, Number(idFolder));
  }
}
