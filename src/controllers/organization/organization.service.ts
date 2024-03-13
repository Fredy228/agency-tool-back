import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { EntityManager, Repository, type UpdateResult } from 'typeorm';
import { Organization } from '../../entity/organization.entity';
import { CustomException } from '../../services/custom-exception';
import { ImageService } from '../../services/image.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private readonly entityManager: EntityManager,
    private readonly imageService: ImageService,
  ) {}

  async createOrganization(
    user: User,
    name: string,
    logoImg: Express.Multer.File | null,
  ): Promise<Organization> {
    const foundOrg = await this.organizationRepository.findOneBy({
      userId: user,
    });

    if (foundOrg)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `The organization already exists`,
      );

    let image = null;

    if (logoImg) {
      image = await this.imageService.optimize(logoImg, {
        width: 460,
        height: 80,
        fit: 'inside',
      });
    }

    const newOrg = this.organizationRepository.create({
      name,
      userId: user,
      logoUrl: image,
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
    logoImg: Express.Multer.File | null,
  ): Promise<UpdateResult> {
    const foundOrg = await this.organizationRepository.findOneBy({
      userId: user,
    });

    if (!foundOrg)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `The organization was not found`,
      );

    let image = undefined;

    if (logoImg) {
      image = await this.imageService.optimize(logoImg, {
        width: 460,
        height: 80,
        fit: 'inside',
      });
    }

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const updater = transactionalEntityManager
          .getRepository(Organization)
          .createQueryBuilder()
          .update(Organization)
          .where('id = :id', { id: foundOrg.id });

        updater.set({ name, logoUrl: image });

        return await updater.execute();
      },
    );
  }

  async deleteLogoOrg(user: User) {
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

        updater.set({ logoUrl: null });

        return await updater.execute();
      },
    );
  }
}
