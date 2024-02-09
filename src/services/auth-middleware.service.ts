import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from './custom-exception';

@Injectable()
export class AuthMiddlewareService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  checkAccessToken(authorization: string | undefined): string {
    return authorization?.startsWith('Bearer') && authorization?.split(' ')[1];
  }

  async findUser(token: string): Promise<User> {
    let decodedToken: { id: any };
    try {
      decodedToken = await this.jwtService.verify(token);
    } catch (error) {
      throw new CustomException(HttpStatus.UNAUTHORIZED, 'Not authorized');
    }

    const currentUser = await this.usersRepository.findOneBy({
      id: decodedToken.id,
    });

    if (!currentUser)
      throw new CustomException(HttpStatus.UNAUTHORIZED, 'Not authorized');

    return currentUser;
  }
}
