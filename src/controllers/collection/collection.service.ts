import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { EntityManager, Repository } from 'typeorm';
import { Collection } from '../../entity/collection.entity';
import { CollectionDto } from './collection.dto';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';
import { ImageService } from '../../services/image.service';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    private readonly entityManager: EntityManager,
    private readonly imageService: ImageService,
  ) {}

  async createCollection(
    user: User,
    { name }: CollectionDto,
    idDashb: number,
    image: Express.Multer.File,
  ) {
    const foundDashboard = await this.dashboardRepository.findOne({
      where: {
        id: idDashb,
        orgId: {
          userId: user,
        },
      },
      relations: {
        collections: true,
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

    console.log('image', image);

    const bufferImage = await this.imageService.optimize(image, {
      width: 427,
      height: 244,
      fit: 'cover',
    });

    console.log('bufferImage', bufferImage);

    const newCollection = this.collectionRepository.create({
      name,
      image: bufferImage,
      dashbId: foundDashboard,
    });

    await this.collectionRepository.save(newCollection);

    return newCollection;
  }
}
