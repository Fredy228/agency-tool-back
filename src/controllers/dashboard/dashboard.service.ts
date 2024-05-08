import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomScreen, Organization } from '../../entity/organization.entity';
import { EntityManager, Repository } from 'typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';
import { DashboardDto } from './dashboard.dto';
import { decryptionData, encryptionData } from '../../services/encryption-data';
import { ImageService } from '../../services/image.service';
import { ScreenDashboard } from '../../entity/screens.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    @InjectRepository(ScreenDashboard)
    private screenDashbRepository: Repository<ScreenDashboard>,
    @InjectRepository(CustomScreen)
    private customScreenRepository: Repository<CustomScreen>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private readonly entityManager: EntityManager,
    private readonly imageService: ImageService,
  ) {}

  async createDashboard(
    user: User,
    body: DashboardDto,
    logoImg: Express.Multer.File | null,
  ) {
    const foundOrg = await this.organizationRepository.findOne({
      where: { userId: user },
      relations: {
        dashboards: true,
      },
      select: {
        dashboards: {
          id: true,
        },
      },
    });

    if (foundOrg.dashboards.length >= 6)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `Your Dashboards limit is 6.`,
      );

    let customScreen = null;

    if (Number(body.screenUrl)) {
      customScreen = await this.customScreenRepository.findOneBy({
        id: Number(body.screenUrl),
      });

      if (!customScreen)
        throw new CustomException(
          HttpStatus.NOT_FOUND,
          `Selected screen not found`,
        );
    }

    let image = null;

    if (logoImg) {
      image = await this.imageService.optimize(logoImg, {
        width: 460,
        height: 80,
        fit: 'inside',
      });
    }

    const encrypt = encryptionData(body.password);

    if (!encrypt)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Error encrypt pass`);

    return this.entityManager.transaction(async (transaction) => {
      const newDashb = transaction.create(Dashboard, {
        ...body,
        password: encrypt,
        orgId: foundOrg,
        logoPartnerUrl: image,
      });

      await transaction.save(newDashb);

      if (customScreen) {
        const newScreen = transaction.create(ScreenDashboard, {
          screen: customScreen,
          dashboard: newDashb,
        });

        await transaction.save(newScreen);

        newDashb.screenBuffer = {
          ...newDashb.screenBuffer,
          screen: customScreen,
        };
      }

      newDashb.password = undefined;

      return newDashb;
    });
  }

  async getDashboards(user: User): Promise<Dashboard[]> {
    const dashboards = await this.dashboardRepository.find({
      where: {
        orgId: {
          userId: user,
        },
      },
      relations: {
        screenBuffer: {
          screen: true,
        },
      },
      select: {
        id: true,
        name: true,
        screenUrl: true,
        screenBuffer: {
          id: true,
          screen: {
            id: true,
            buffer: true,
          },
        },
      },
    });

    if (!dashboards)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `The dashboards was not found`,
      );

    return dashboards;
  }

  async getOneDashboard(
    id: number,
    password: string,
    user: User,
  ): Promise<Dashboard> {
    const foundDashboard = await this.dashboardRepository.findOne({
      where: { id },
      relations: {
        orgId: {
          userId: true,
        },
        links: true,
        collections: {
          imageBuffer: {
            screen: true,
          },
        },
        screenBuffer: {
          screen: true,
        },
      },
      select: {
        collections: {
          id: true,
          image: true,
          name: true,
          imageBuffer: {
            id: true,
            screen: {
              id: true,
              buffer: true,
            },
          },
        },
        links: {
          id: true,
          name: true,
          image: true,
          description: true,
          url: true,
        },
        orgId: {
          id: true,
          logoUrl: true,
          userId: {
            id: true,
          },
        },
        screenBuffer: {
          id: true,
          screen: {
            id: true,
            buffer: true,
          },
        },
      },
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    if (user && foundDashboard.orgId?.userId?.id === user.id) {
      const passDecrypt = decryptionData(foundDashboard.password);
      if (!passDecrypt)
        throw new CustomException(
          HttpStatus.BAD_REQUEST,
          `Error decrypt password`,
        );
      foundDashboard.password = passDecrypt;
      return foundDashboard;
    }

    if (!password)
      throw new CustomException(HttpStatus.BAD_REQUEST, `No password entered`);

    const decryptPass = decryptionData(foundDashboard.password);

    if (decryptPass !== password)
      throw new CustomException(HttpStatus.FORBIDDEN, `Wrong password`);

    if (!user || foundDashboard.orgId.userId.id !== user.id)
      foundDashboard.password = undefined;

    return foundDashboard;
  }

  async deleteDashboard(user: User, idDash: number) {
    if (!idDash)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Incorrect id`);

    const foundDashboard = await this.dashboardRepository.findOne({
      where: {
        id: idDash,
        orgId: {
          userId: user,
        },
      },
      relations: {
        screenBuffer: true,
      },
      select: {
        screenBuffer: {
          id: true,
        },
      },
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    return this.entityManager.transaction(async (transaction) => {
      if (foundDashboard.screenBuffer) {
        await transaction.delete(
          ScreenDashboard,
          foundDashboard.screenBuffer.id,
        );
      }
      await transaction.delete(Dashboard, foundDashboard.id);

      return;
    });
  }

  async updateDashboard(
    user: User,
    idDashb: number,
    body: Partial<DashboardDto>,
    logoImg: Express.Multer.File | null,
  ) {
    const foundDashboard = await this.dashboardRepository.findOne({
      where: { id: idDashb, orgId: { userId: user } },
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    if (Object.keys(body).length === 0 && !logoImg) return;

    console.log('body', body);

    return this.entityManager.transaction(async (transaction) => {
      let customScreen = null;
      let screenDashboard: ScreenDashboard = null;

      if (Number(body.screenUrl)) {
        customScreen = await transaction.findOne(CustomScreen, {
          where: {
            id: Number(body.screenUrl),
          },
        });

        if (!customScreen)
          throw new CustomException(
            HttpStatus.NOT_FOUND,
            `Selected screen not found`,
          );

        if (Number(foundDashboard.screenUrl)) {
          screenDashboard = await transaction.findOneBy(ScreenDashboard, {
            dashboard: foundDashboard,
          });

          if (!screenDashboard) {
            const newScreen = transaction.create(ScreenDashboard, {
              screen: customScreen,
              dashboard: foundDashboard,
            });

            await transaction.save(newScreen);
          } else {
            await transaction.update(ScreenDashboard, screenDashboard, {
              screen: customScreen,
            });
          }
        } else {
          const newScreen = transaction.create(ScreenDashboard, {
            screen: customScreen,
            dashboard: foundDashboard,
          });

          await transaction.save(newScreen);
        }
      }

      let image = undefined;

      if (logoImg) {
        image = await this.imageService.optimize(logoImg, {
          width: 460,
          height: 80,
          fit: 'inside',
        });
      }

      let encrypt = undefined;

      if (body.password) encrypt = encryptionData(body.password);

      await this.dashboardRepository.update(foundDashboard, {
        textOne: body?.textOne,
        textTwo: body?.textTwo,
        textThree: body?.textThree,
        screenUrl: body?.screenUrl,
        name: body?.name,
        password: encrypt,
        logoPartnerUrl: image,
      });

      return;
    });
  }

  async deleteLogoPartner(user: User, idDash: number) {
    if (!idDash)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Incorrect id`);

    const foundDashboard = await this.dashboardRepository.findOne({
      where: {
        id: idDash,
        orgId: {
          userId: user,
        },
      },
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    await this.dashboardRepository.update(foundDashboard, {
      logoPartnerUrl: null,
    });

    return;
  }
}
