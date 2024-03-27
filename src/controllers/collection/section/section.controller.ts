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
import { SectionService } from './section.service';
import { Request } from 'express';
import { User } from '../../../entity/user.entity';

@Controller('api/collection/section')
export class SectionController {
  constructor(private readonly serviceSection: SectionService) {}

  @Post('/:idCollection')
  @HttpCode(201)
  async create(
    @Param('idCollection') idCollection: string,
    @Req() req: Request & { user: User },
    @Body() { name }: { name: string },
  ) {
    return this.serviceSection.create(req.user, Number(idCollection), name);
  }

  @Patch('/:idSection')
  @HttpCode(204)
  async update(
    @Param('idSection') idSection: string,
    @Req() req: Request & { user: User },
    @Body() { name }: { name: string },
  ) {
    return this.serviceSection.update(req.user, Number(idSection), name);
  }

  @Delete(':idSection')
  @HttpCode(204)
  async delete(
    @Param('idSection') idSection: string,
    @Req() req: Request & { user: User },
  ) {
    return this.serviceSection.delete(req.user, Number(idSection));
  }
}
