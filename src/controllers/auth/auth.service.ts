import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './auth.entity';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signInCredentials({ email, password }: LoginAuthDto) {
    return '';
  }

  async signUpCredentials({ email, password, firstName }: RegisterAuthDto) {
    const userFound = await this.usersRepository.findOneBy({ email });
    if (userFound)
      throw new CustomException(
        StatusEnum.UNAUTHORIZED,
        `Such a user already exists`,
      );
  }
}
