import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { EntityManager, Repository } from 'typeorm';
import { Collection } from '../../entity/collection.entity';
import { CollectionDto } from './collection.dto';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';
import { decryptionData } from '../../services/encryption-data';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    private readonly entityManager: EntityManager,
  ) {}

  async createCollection(
    user: User,
    { name, imageUrl }: CollectionDto,
    idDashb: number,
  ) {
    const foundDashboard = await this.dashboardRepository.findOne({
      where: {
        id: idDashb,
        orgId: {
          userId: user,
        },
      },
      relations: ['collections'],
      select: {
        collections: {
          id: true,
        },
      },
    });

    console.log('foundDashboard', foundDashboard);

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Dashboard not found`);

    if (foundDashboard.collections.length >= 3)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `Your Collections limit is 3.`,
      );

    const newCollection = this.collectionRepository.create({
      name,
      image: imageUrl,
      dashbId: foundDashboard,
    });

    await this.collectionRepository.save(newCollection);

    return newCollection;
  }

  async getCollectionById(
    user: User,
    idCollection: number,
    password: string | undefined,
  ): Promise<Collection> {
    const foundCollection = await this.collectionRepository.findOne({
      relations: {
        dashbId: {
          orgId: {
            userId: true,
          },
        },
      },
      select: {
        dashbId: {
          id: true,
          password: true,
          orgId: {
            userId: {
              id: true,
            },
          },
        },
      },
      where: {
        id: idCollection,
      },
    });

    if (!foundCollection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Collection not found`);

    if (user && foundCollection?.dashbId?.orgId?.userId?.id === user.id) {
      foundCollection.dashbId = undefined;

      return foundCollection;
    }

    if (!password)
      throw new CustomException(HttpStatus.BAD_REQUEST, `No password entered`);

    const decryptPass = decryptionData(foundCollection.dashbId.password);

    if (decryptPass !== password)
      throw new CustomException(HttpStatus.FORBIDDEN, `Wrong password`);

    foundCollection.dashbId = undefined;

    return foundCollection;
  }

  async updateCollection(user: User, id: number, body: Partial<CollectionDto>) {
    const foundCollection = await this.collectionRepository.findOneBy({
      id,
      dashbId: {
        orgId: {
          userId: user,
        },
      },
    });

    if (!foundCollection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Collection not found`);

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .getRepository(Collection)
          .createQueryBuilder()
          .update(Collection)
          .set({ ...body })
          .where('id = :id', { id: foundCollection.id })
          .execute();

        return;
      },
    );
  }

  async deleteCollection(user: User, id: number): Promise<void> {
    const foundCollection = await this.collectionRepository.findOneBy({
      id,
      dashbId: {
        orgId: {
          userId: user,
        },
      },
    });

    if (!foundCollection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Collection not found`);

    await this.collectionRepository.delete(foundCollection);

    return;
  }
}
