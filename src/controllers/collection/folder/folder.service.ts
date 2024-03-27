import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CollectionFolder,
  CollectionSection,
} from '../../../entity/collection.entity';
import { Repository } from 'typeorm';
import { User } from '../../../entity/user.entity';
import { CustomException } from '../../../services/custom-exception';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(CollectionSection)
    private sectionRepository: Repository<CollectionSection>,
    @InjectRepository(CollectionFolder)
    private folderRepository: Repository<CollectionFolder>,
  ) {}

  async create(user: User, idSection: number, name: string) {
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

    const newFolder = this.folderRepository.create({
      name,
      section: foundSection,
    });

    await this.folderRepository.save(newFolder);

    return newFolder;
  }

  async update(user: User, idFolder: number, name: string) {
    if (!idFolder)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Wrong id folder`);
    if (!name) return;

    const foundFolder = await this.folderRepository.findOneBy({
      id: idFolder,
      section: {
        details: {
          collection: {
            dashbId: {
              orgId: {
                userId: user,
              },
            },
          },
        },
      },
    });

    if (!foundFolder)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found folder`);

    await this.folderRepository.update(foundFolder, { name });

    return;
  }

  async delete(user: User, idFolder: number) {
    if (!idFolder)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Wrong id folder`);

    const foundFolder = await this.folderRepository.findOneBy({
      id: idFolder,
      section: {
        details: {
          collection: {
            dashbId: {
              orgId: {
                userId: user,
              },
            },
          },
        },
      },
    });

    if (!foundFolder)
      throw new CustomException(HttpStatus.NOT_FOUND, `Not found folder`);

    await this.folderRepository.delete(foundFolder);

    return;
  }
}
