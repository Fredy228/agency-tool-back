import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { Organization } from '../../entity/organization.entity';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private readonly entityManager: EntityManager,
  ) {}

  async createOrganization(
    user: User,
    name: string,
    logoImg: Express.Multer.File,
  ): Promise<Organization> {
    console.log('logoImg', logoImg);

    const foundOrg = await this.organizationRepository.findOneBy({
      userId: user,
    });

    if (foundOrg)
      throw new CustomException(
        StatusEnum.BAD_REQUEST,
        `The organization already exists`,
      );

    const newOrg = this.organizationRepository.create({
      name,
      userId: user,
    });
    await this.organizationRepository.save(newOrg);

    return newOrg;
  }

  async getOrganization(user: User): Promise<Organization> {
    const foundOrg = await this.organizationRepository.findOneBy({
      userId: user,
    });

    if (!foundOrg)
      throw new CustomException(
        StatusEnum.NOT_FOUND,
        `The organization was not found`,
      );

    return foundOrg;
  }
}
