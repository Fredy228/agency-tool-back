import {
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
import { CustomScreensService } from './custom-screens.service';
import { ImageValidatorPipe } from '../../pipe/validator-img.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { User } from '../../entity/user.entity';

@Controller('api/custom-screens')
export class CustomScreensController {
  constructor(private readonly customScreensService: CustomScreensService) {}

  @Post('/dashboard')
  @HttpCode(201)
  @UsePipes(new ImageValidatorPipe({ maxSize: 5 }))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'screen', maxCount: 1 }]))
  async createScreenDashboard(
    @Req() req: Request & { user: User },
    @UploadedFiles()
    files: {
      screen?: Array<Express.Multer.File>;
    },
  ) {
    return this.customScreensService.createScreenDashboard(
      req.user,
      files?.screen[0],
    );
  }

  @Get('/dashboard')
  @HttpCode(200)
  async getScreensDashboard(@Req() req: Request & { user: User }) {
    return this.customScreensService.getScreenDashboard(req.user);
  }

  @Delete('dashboard/:idScreen')
  @HttpCode(204)
  async deleteScreenDashboard(
    @Param('idScreen') idScreen: string,
    @Req() req: Request & { user: User },
  ) {
    return this.customScreensService.deleteScreenDashboard(
      req.user,
      Number(idScreen),
    );
  }

  @Post('/collection')
  @HttpCode(201)
  @UsePipes(new ImageValidatorPipe({ maxSize: 5 }))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'screen', maxCount: 1 }]))
  async createScreenCollection(
    @Req() req: Request & { user: User },
    @UploadedFiles()
    files: {
      screen?: Array<Express.Multer.File>;
    },
  ) {
    return this.customScreensService.createScreenCollection(
      req.user,
      files?.screen[0],
    );
  }

  @Get('/collection')
  @HttpCode(200)
  async getScreensCollection(@Req() req: Request & { user: User }) {
    return this.customScreensService.getScreenCollection(req.user);
  }

  @Delete('collection/:idScreen')
  @HttpCode(204)
  async deleteScreenCollection(
    @Param('idScreen') idScreen: string,
    @Req() req: Request & { user: User },
  ) {
    return this.customScreensService.deleteScreenCollection(
      req.user,
      Number(idScreen),
    );
  }
}
