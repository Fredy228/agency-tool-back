import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { Request } from 'express';
import { User } from '../../entity/user.entity';
import {
  linkCreateSchema,
  linkUpdateSchema,
} from '../../joi-schema/linkSchema';
import { LinkDto } from './link.dto';
import { Link } from '../../entity/link.entity';

@Controller('api/link')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post('/:idDashboard')
  @HttpCode(201)
  @UsePipes(new BodyValidationPipe(linkCreateSchema))
  async create(
    @Param('idDashboard') idDashboard: string,
    @Req() req: Request & { user: User },
    @Body() body: LinkDto,
  ): Promise<Link> {
    return this.linkService.createLink(req.user, body, Number(idDashboard));
  }

  @Patch('/:idLink')
  @HttpCode(200)
  @UsePipes(new BodyValidationPipe(linkUpdateSchema))
  async update(
    @Param('idLink') idLink: string,
    @Req() req: Request & { user: User },
    @Body() body: Partial<LinkDto>,
  ) {
    return this.linkService.updateLink(req.user, body, Number(idLink));
  }

  @Delete('/:idLink')
  @HttpCode(200)
  async delete(
    @Param('idLink') idLink: string,
    @Req() req: Request & { user: User },
  ) {
    return this.linkService.deleteLink(req.user, Number(idLink));
  }
}
