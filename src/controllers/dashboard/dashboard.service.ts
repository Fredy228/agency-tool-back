import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '../../entity/organization.entity';
import { EntityManager, Repository } from 'typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';
import { DashboardDto } from './dashboard.dto';

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

    console.log('foundOrg', foundOrg);

    if (foundOrg.dashboards.length >= 3)
      throw new CustomException(
        StatusEnum.BAD_REQUEST,
        `Your Dashboards limit is 3.`,
      );

    const newOrg = this.dashboardRepository.create({
      ...body,
      screenUrl:
        'https://s3-alpha-sig.figma.com/img/6472/84c4/5a4cfaddcd2f1e70c7ca34f86c09438a?Expires=1707091200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=d266viCAS8gNAg56Bb9sZSkhSP~6q8p7YS8ExaxIesNiZuqHsUlprwxVqAjSKoN3UgTS3tClEjWbvQzCzmP9aLfv7PNIvd1RuBzV7wiltpQWZ0Gdx-BNPGZykrGqowUzZ1HzBYmrfhePRuxW9ZClMR8YSQKF9KTZMVuOXei-Fdn5hEdwDLBiuYOFQ8mId-RH0i5Us0OSWq2WhrLXgllGER2PTEUhAbDBgptC4uvUWCRToEJFWsKsBKMJePwT-F6Pw6i3DN9BJF-gRDuNXSG927n4ecYw2lqbufroeuyPw8msBfj49ShWbsW63xvvU8oXwCpOYe0U93hp00ErFTOncg__',
      orgId: foundOrg,
    });
    await this.dashboardRepository.save(newOrg);

    return newOrg;
  }
}
