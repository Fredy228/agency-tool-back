import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '../../entity/organization.entity';
import { EntityManager, Repository } from 'typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';
import { DashboardDto } from './dashboard.dto';
import { decryptionData, encryptionData } from '../../services/encryption-data';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private readonly entityManager: EntityManager,
  ) {}

  async createDashboard(user: User, body: DashboardDto) {
    const foundOrg = await this.organizationRepository.findOne({
      where: { userId: user },
      relations: {
        dashboards: true,
      },
    });

    if (foundOrg.dashboards.length >= 6)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `Your Dashboards limit is 6.`,
      );

    const encrypt = encryptionData(body.password);

    const newOrg = this.dashboardRepository.create({
      ...body,
      password: encrypt,
      orgId: foundOrg,
    });
    await this.dashboardRepository.save(newOrg);

    newOrg.password = undefined;

    return newOrg;
  }

  async getDashboards(user: User): Promise<Dashboard[]> {
    const foundOrg = await this.organizationRepository.findOneBy({
      userId: user,
    });

    if (!foundOrg)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `The organization was not found`,
      );

    return await this.dashboardRepository.find({
      select: {
        id: true,
        name: true,
        screenUrl: true,
      },
      where: {
        orgId: foundOrg,
      },
    });
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
      },
    });

    if (!foundDashboard)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `Not found dashboard or Wrong password`,
      );

    if (user && foundDashboard.orgId.userId.id === user.id)
      return foundDashboard;

    if (!password)
      throw new CustomException(HttpStatus.NOT_FOUND, `No password entered`);

    const decryptPass = decryptionData(foundDashboard.password);

    if (decryptPass !== password)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `Not found dashboard or Wrong password`,
      );

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
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    return await this.dashboardRepository.delete(foundDashboard.id);
  }
}
