import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { User } from '../../entity/user.entity';
import { OrganizationService } from './organization.service';
import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { organizationCreateSchema } from '../../joi-schema/organizationSchema';
import { OrganizationDto } from './organization.dto';
import { ImageValidatorPipe } from '../../pipe/validator-img.pipe';
import { Organization } from '../../entity/organization.entity';

@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('/')
  @HttpCode(201)
  @UsePipes(
    new BodyValidationPipe(organizationCreateSchema),
    new ImageValidatorPipe({ maxSize: 5 }),
  )
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]))
  async create(
    @Req() req: Request & { user: User },
    @UploadedFiles()
    files: {
      logo?: Array<Express.Multer.File>;
    },
    @Body() { name }: OrganizationDto,
  ): Promise<Organization> {
    return this.organizationService.createOrganization(
      req.user,
      name,
      files.logo ? files.logo[0] : null,
    );
  }

  @Get('/')
  @HttpCode(200)
  async getAll(@Req() req: Request & { user: User }): Promise<Organization> {
    return this.organizationService.getOrganization(req.user);
  }
}
