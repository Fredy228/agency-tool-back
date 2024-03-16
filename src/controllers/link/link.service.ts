import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { LinkDto } from './link.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dashboard } from '../../entity/dashboard.entity';
import { EntityManager, Repository } from 'typeorm';
import { Link } from '../../entity/link.entity';
import { CustomException } from '../../services/custom-exception';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    private readonly entityManager: EntityManager,
  ) {}
  async createLink(
    user: User,
    body: LinkDto,
    idDashboard: number,
  ): Promise<Link> {
    const foundDashboard = await this.dashboardRepository.findOne({
      where: {
        id: idDashboard,
        orgId: {
          userId: user,
        },
      },
      relations: {
        links: true,
      },
    });

    if (!foundDashboard)
      throw new CustomException(HttpStatus.NOT_FOUND, `Dashboard not found`);

    if (foundDashboard.links.length >= 12)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `Your Links limit is 12.`,
      );

    const newLInk = this.linkRepository.create({
      image: body.image,
      name: body.name,
      url: body.url,
      description: body.description,
      dashbId: foundDashboard,
    });

    await this.linkRepository.save(newLInk);

    return newLInk;
  }

  async updateLink(user: User, body: Partial<LinkDto>, idLink: number) {
    if (!idLink)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Incorrect id`);

    const foundLink = await this.linkRepository.findOne({
      where: {
        id: idLink,
        dashbId: {
          orgId: {
            userId: user,
          },
        },
      },
    });

    if (!foundLink)
      throw new CustomException(HttpStatus.NOT_FOUND, `Link not found`);

    await this.linkRepository.update(foundLink, {
      image: body.image,
      name: body.name,
      url: body.url,
      description: body.description,
    });

    return;
  }

  async deleteLink(user: User, idLink: number) {
    if (!idLink)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Incorrect id`);

    const foundLink = await this.linkRepository.findOne({
      where: {
        id: idLink,
        dashbId: {
          orgId: {
            userId: user,
          },
        },
      },
    });

    if (!foundLink)
      throw new CustomException(HttpStatus.NOT_FOUND, `Link not found`);

    return await this.linkRepository.delete(foundLink.id);
  }
}
