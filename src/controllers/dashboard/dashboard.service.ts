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

    if (!encrypt)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Error encrypt pass`);

    const newDashb = this.dashboardRepository.create({
      ...body,
      password: encrypt,
      orgId: foundOrg,
    });
    await this.dashboardRepository.save(newDashb);

    newDashb.password = undefined;

    return newDashb;
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
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    if (user && foundDashboard.orgId.userId.id === user.id) {
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
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    return await this.dashboardRepository.delete(foundDashboard.id);
  }

  async updateDashboard(
    user: User,
    idDashb: number,
    body: Partial<DashboardDto>,
  ) {
    const foundDashboard = await this.dashboardRepository.findOne({
      where: { id: idDashb, orgId: { userId: user } },
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found dashboard`);

    if (Object.keys(body).length === 0) return;

    let encrypt = undefined;

    if (body.password) encrypt = encryptionData(body.password);

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .getRepository(Dashboard)
          .createQueryBuilder()
          .update(Dashboard)
          .set({
            textOne: body?.textOne,
            textTwo: body?.textTwo,
            textThree: body?.textThree,
            screenUrl: body?.screenUrl,
            name: body?.name,
            password: encrypt,
          })
          .where('id = :id', { id: foundDashboard.id })
          .execute();

        return;
      },
    );
  }
}
