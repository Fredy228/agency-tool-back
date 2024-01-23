import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { BodyValidationPipe } from '../../pipe/validator-body.pipe';
import { ImageValidatorPipe } from '../../pipe/validator-img.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { User } from '../../entity/user.entity';
import { dashboardCreateSchema } from '../../joi-schema/dashboardSchema';
import { DashboardDto } from './dashboard.dto';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('/')
  @HttpCode(201)
  @UsePipes(
    new BodyValidationPipe(dashboardCreateSchema),
    new ImageValidatorPipe({ maxSize: 5 }),
  )
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoPartner', maxCount: 1 },
      { name: 'imageScreen', maxCount: 1 },
    ]),
  )
  async create(
    @Req() req: Request & { user: User },
    @UploadedFiles()
    files: {
      logoPartner?: Array<Express.Multer.File>;
      imageScreen?: Array<Express.Multer.File>;
    },
    @Body() body: DashboardDto,
  ) {
    return this.dashboardService.createDashboard(req.user, body);
  }
}
