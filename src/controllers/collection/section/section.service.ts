import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Collection,
  CollectionSection,
} from '../../../entity/collection.entity';
import { Repository } from 'typeorm';
import { CustomException } from '../../../services/custom-exception';
import { User } from '../../../entity/user.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionSection)
    private sectionRepository: Repository<CollectionSection>,
  ) {}

  async create(user: User, idCollection: number, name: string) {
    if (!idCollection)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Wrong id collection`);

    const foundCollection = await this.collectionRepository.findOne({
      where: {
        id: idCollection,
        dashbId: {
          orgId: {
            userId: user,
          },
        },
      },
      relations: {
        details: true,
      },
    });

    if (!foundCollection || !foundCollection.details)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `Not found collection or details`,
      );

    const newSection = this.sectionRepository.create({
      details: foundCollection.details,
      name,
    });

    await this.sectionRepository.save(newSection);

    return newSection;
  }

  async update(user: User, idSection: number, name: string | undefined) {
    if (!idSection)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Wrong id section`);
    if (!name) return;

    const foundSection = await this.sectionRepository.findOneBy({
      id: idSection,
      details: {
        collection: {
          dashbId: {
            orgId: {
              userId: user,
            },
          },
        },
      },
    });

    if (!foundSection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found section`);

    await this.sectionRepository.update(foundSection, {
      name,
    });

    return;
  }

  async delete(user: User, idSection: number) {
    if (!idSection)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Wrong id section`);

    const foundSection = await this.sectionRepository.findOneBy({
      id: idSection,
      details: {
        collection: {
          dashbId: {
            orgId: {
              userId: user,
            },
          },
        },
      },
    });

    if (!foundSection)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found section`);

    await this.sectionRepository.delete(foundSection);
  }
}
