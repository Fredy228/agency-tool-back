import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { Dashboard } from '../../entity/dashboard.entity';

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
    },
    @Body() body: DashboardDto,
  ) {
    console.log('body', body);
    return this.dashboardService.createDashboard(req.user, body);
  }

  @Get('/')
  @HttpCode(200)
  async getAll(@Req() req: Request & { user: User }): Promise<Dashboard[]> {
    return this.dashboardService.getDashboards(req.user);
  }

  @Delete('/:idDashboard')
  @HttpCode(204)
  async delete(
    @Param('idDashboard') idDashb: string,
    @Req() req: Request & { user: User },
  ) {
    return this.dashboardService.deleteDashboard(req.user, Number(idDashb));
  }
}
