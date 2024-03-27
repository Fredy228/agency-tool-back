import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { EntityManager, Repository } from 'typeorm';
import { Collection, CollectionDetails } from '../../entity/collection.entity';
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
    @InjectRepository(CollectionDetails)
    private detailsRepository: Repository<CollectionDetails>,
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

    return this.entityManager.transaction(async () => {
      const newCollection = this.collectionRepository.create({
        name,
        image: imageUrl,
        dashbId: foundDashboard,
      });

      await this.collectionRepository.save(newCollection);

      if (customScreen) {
        const newScreen = this.screenCollectionRepository.create({
          screen: customScreen,
          collection: newCollection,
        });

        await this.screenCollectionRepository.save(newScreen);
      }

      const newDetails = this.detailsRepository.create({
        collection: newCollection,
      });

      await this.detailsRepository.save(newDetails);

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
        details: {
          sections: {
            folders: true,
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

    return this.entityManager.transaction(async () => {
      let customScreen = null;
      let screenCollection: ScreenCollection = null;

      await this.collectionRepository.update(foundCollection, {
        name,
        image,
      });

      if (Number(image)) {
        customScreen = await this.collectionScreenRepository.findOne({
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
          screenCollection = await this.screenCollectionRepository.findOneBy({
            collection: foundCollection,
          });

          if (!screenCollection) {
            const newScreen = this.screenCollectionRepository.create({
              screen: customScreen,
              collection: foundCollection,
            });

            await this.screenCollectionRepository.save(newScreen);
          } else {
            await this.screenCollectionRepository.update(screenCollection, {
              screen: customScreen,
            });
          }
        } else {
          const newScreen = this.screenCollectionRepository.create({
            screen: customScreen,
            collection: foundCollection,
          });

          await this.screenCollectionRepository.save(newScreen);
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

    return this.entityManager.transaction(async () => {
      await this.collectionRepository.delete(foundCollection.id);

      if (foundCollection.imageBuffer) {
        await this.screenCollectionRepository.delete(
          foundCollection.imageBuffer.id,
        );
      }

      return;
    });
  }
}
