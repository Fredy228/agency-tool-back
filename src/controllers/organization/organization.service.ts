import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { EntityManager, Repository, type UpdateResult } from 'typeorm';
import { Organization } from '../../entity/organization.entity';
import { CustomException } from '../../services/custom-exception';

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
        HttpStatus.BAD_REQUEST,
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
        HttpStatus.NOT_FOUND,
        `The organization was not found`,
      );

    return foundOrg;
  }

  async updateOrganization(
    user: User,
    name: string | undefined,
  ): Promise<UpdateResult> {
    const foundOrg = await this.organizationRepository.findOneBy({
      userId: user,
    });

    if (!foundOrg)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `The organization was not found`,
      );

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const updater = transactionalEntityManager
          .getRepository(Organization)
          .createQueryBuilder()
          .update(Organization)
          .where('id = :id', { id: foundOrg.id });

        updater.set({ name });

        return await updater.execute();
      },
    );
  }
}
