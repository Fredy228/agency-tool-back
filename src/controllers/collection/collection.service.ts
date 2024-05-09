import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { EntityManager, Repository } from 'typeorm';
import { Collection } from '../../entity/collection.entity';
import { CollectionDto } from './collection.dto';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';
import { decryptionData } from '../../services/encryption-data';
import { ScreenCollection } from '../../entity/screens.entity';
import { CollectionScreen } from '../../entity/organization.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(ScreenCollection)
    private screenCollectionRepository: Repository<ScreenCollection>,
    @InjectRepository(CollectionScreen)
    private collectionScreenRepository: Repository<CollectionScreen>,
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

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Dashboard not found`);

    if (foundDashboard.collections.length >= 3)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `Your Collections limit is 3`,
      );

    let customScreen = null;

    if (Number(imageUrl)) {
      customScreen = await this.collectionScreenRepository.findOneBy({
        id: Number(imageUrl),
      });

      if (!customScreen)
        throw new CustomException(
          HttpStatus.NOT_FOUND,
          `Selected screen not found`,
        );
    }

    return this.entityManager.transaction(async (transaction) => {
      const newCollection = transaction.create(Collection, {
        name,
        image: imageUrl,
        dashbId: foundDashboard,
      });

      await this.collectionRepository.save(newCollection);

      if (customScreen) {
        const newScreen = transaction.create(ScreenCollection, {
          screen: customScreen,
          collection: newCollection,
        });

        await transaction.save(newScreen);
      }

      return { ...newCollection, imageBuffer: { screen: customScreen } };
    });
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
        sections: {
          folders: true,
        },
      },
      select: {
        dashbId: {
          id: true,
          password: true,
          orgId: {
            id: true,
            name: true,
            userId: {
              id: true,
              email: true,
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

    console.log('user-check', user);
    console.log(foundCollection);

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

  async updateCollection(
    user: User,
    id: number,
    { imageUrl, name }: Partial<CollectionDto>,
  ) {
    const foundCollection = await this.collectionRepository.findOneBy({
      id,
      dashbId: {
        orgId: {
          userId: user,
        },
      },
    });

    const image = imageUrl;

    if (!foundCollection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Collection not found`);

    return this.entityManager.transaction(async (transaction) => {
      let customScreen = null;
      let screenCollection: ScreenCollection = null;

      await transaction.update(Collection, foundCollection.id, {
        name,
        image,
      });

      if (Number(image)) {
        customScreen = await transaction.findOne(CollectionScreen, {
          where: {
            id: Number(image),
          },
        });

        if (!customScreen)
          throw new CustomException(
            HttpStatus.NOT_FOUND,
            `Selected screen not found`,
          );

        if (Number(foundCollection.image)) {
          screenCollection = await transaction.findOneBy(ScreenCollection, {
            collection: foundCollection,
          });

          if (!screenCollection) {
            const newScreen = transaction.create(ScreenCollection, {
              screen: customScreen,
              collection: foundCollection,
            });

            await transaction.save(newScreen);
          } else {
            await transaction.update(ScreenCollection, screenCollection.id, {
              screen: customScreen,
            });
          }
        } else {
          const newScreen = transaction.create(ScreenCollection, {
            screen: customScreen,
            collection: foundCollection,
          });

          await transaction.save(newScreen);
        }
      }

      return customScreen;
    });
  }

  async deleteCollection(user: User, id: number): Promise<void> {
    const foundCollection = await this.collectionRepository.findOne({
      where: {
        id,
        dashbId: {
          orgId: {
            userId: user,
          },
        },
      },
      relations: {
        imageBuffer: true,
      },
      select: {
        imageBuffer: {
          id: true,
        },
      },
    });

    if (!foundCollection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Collection not found`);

    return this.entityManager.transaction(async (transaction) => {
      await transaction.delete(Collection, foundCollection.id);

      if (foundCollection.imageBuffer) {
        await transaction.delete(
          ScreenCollection,
          foundCollection.imageBuffer.id,
        );
      }

      return;
    });
  }
}
