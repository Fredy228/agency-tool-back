import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CollectionScreen,
  CustomScreen,
  Organization,
} from '../../entity/organization.entity';
import { Repository } from 'typeorm';
import { ImageService } from '../../services/image.service';
import { User } from '../../entity/user.entity';
import { CustomException } from '../../services/custom-exception';

@Injectable()
export class CustomScreensService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(CustomScreen)
    private customScreenRepository: Repository<CustomScreen>,
    @InjectRepository(CollectionScreen)
    private collectionScreenRepository: Repository<CollectionScreen>,
    private readonly imageService: ImageService,
  ) {}
  async checkOrg(
    user: User,
    relation: 'customScreens' | 'collectionScreens',
  ): Promise<Organization> {
    const foundOrg = await this.organizationRepository.findOne({
      where: {
        userId: user,
      },
      relations: [relation],
      select: {
        id: true,
      },
    });

    if (!foundOrg)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        `The organization not found`,
      );

    return foundOrg;
  }

  async createScreenDashboard(
    user: User,
    image: Express.Multer.File | undefined,
  ): Promise<CustomScreen> {
    if (!image)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `You haven't uploaded an image`,
      );

    const organization = await this.checkOrg(user, 'customScreens');

    if (organization?.customScreens?.length >= 5)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `You can upload a maximum of 5 images`,
      );

    const buffer = await this.imageService.optimize(image, {
      width: 674,
      height: 884,
      fit: 'cover',
    });

    const screen = this.customScreenRepository.create({
      buffer,
      orgId: organization,
    });

    await this.customScreenRepository.save(screen);

    return screen;
  }

  async getScreenDashboard(user: User): Promise<CustomScreen[]> {
    const org = await this.organizationRepository.findOne({
      where: {
        userId: user,
      },
      relations: {
        customScreens: true,
      },
      select: {
        id: true,
        customScreens: true,
      },
    });

    return org.customScreens ? org.customScreens : [];
  }

  async createScreenCollection(
    user: User,
    image: Express.Multer.File | undefined,
  ): Promise<CollectionScreen> {
    if (!image)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `You haven't uploaded an image`,
      );

    const organization = await this.checkOrg(user, 'collectionScreens');

    if (organization?.collectionScreens?.length >= 5)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `You can upload a maximum of 5 images`,
      );

    const buffer = await this.imageService.optimize(image, {
      width: 555,
      height: 317,
      fit: 'cover',
    });

    const screen = this.collectionScreenRepository.create({
      buffer,
      orgId: organization,
    });

    await this.collectionScreenRepository.save(screen);

    return screen;
  }

  async getScreenCollection(user: User): Promise<CollectionScreen[]> {
    const org = await this.organizationRepository.findOne({
      where: {
        userId: user,
      },
      relations: {
        collectionScreens: true,
      },
      select: {
        id: true,
        collectionScreens: true,
      },
    });

    return org.collectionScreens ? org.collectionScreens : [];
  }

  async deleteScreenDashboard(user: User, id: number): Promise<void> {
    const foundScreen = await this.customScreenRepository.findOneBy({
      id,
      orgId: {
        userId: user,
      },
    });

    if (!foundScreen)
      throw new CustomException(HttpStatus.NOT_FOUND, `The screen not found`);

    await this.customScreenRepository.delete(foundScreen);

    return;
  }

  async deleteScreenCollection(user: User, id: number): Promise<void> {
    const foundScreen = await this.collectionScreenRepository.findOneBy({
      id,
      orgId: {
        userId: user,
      },
    });

    if (!foundScreen)
      throw new CustomException(HttpStatus.NOT_FOUND, `The screen not found`);

    await this.collectionScreenRepository.delete(foundScreen);

    return;
  }
}
