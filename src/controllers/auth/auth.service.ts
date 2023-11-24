import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './auth.entity';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';
import { checkPassword, hashPassword } from '../../services/hashPassword';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signInCredentials({ email, password }: LoginAuthDto) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user)
      throw new CustomException(
        StatusEnum.UNAUTHORIZED,
        `Username or password is wrong`,
      );
    const isValidPass = await checkPassword(password, user.password);

    if (!isValidPass)
      throw new CustomException(
        StatusEnum.UNAUTHORIZED,
        `Username or password is wrong`,
      );

    user.password = null;

    return user;
  }

  async signUpCredentials({ email, password, firstName }: RegisterAuthDto) {
    const userFound = await this.usersRepository.findOneBy({ email });
    if (userFound)
      throw new CustomException(
        StatusEnum.UNAUTHORIZED,
        `Such a user already exists`,
      );

    const hashPass = await hashPassword(password);

    const newUser = this.usersRepository.create({
      email,
      password: hashPass,
      firstName,
    });
    await this.usersRepository.save(newUser);

    newUser.password = null;

    return newUser;
  }
}
