import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User, UserDevices } from './auth.entity';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { CustomException } from '../../services/custom-exception';
import { StatusEnum } from '../../enum/error/StatusEnum';
import { checkPassword, hashPassword } from '../../services/hashPassword';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(UserDevices)
    private devicesRepository: Repository<UserDevices>,
    private jwtService: JwtService,
  ) {}

  async signInCredentials({
    email,
    password,
    deviceModel,
  }: LoginAuthDto): Promise<User & { token: string }> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['devices'],
    });

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

    console.log('user', user);

    user.password = null;

    const token = await this.addDeviceAuth(deviceModel, user);

    return { ...user, token };
  }

  async signUpCredentials({
    email,
    password,
    deviceModel,
  }: RegisterAuthDto): Promise<User & { token: string }> {
    const userFound = await this.usersRepository.findOneBy({ email });
    if (userFound)
      throw new CustomException(
        StatusEnum.UNAUTHORIZED,
        `Such a user already exists`,
      );

    const hashPass = await hashPassword(password);

    const firstName = `user${Math.floor(Math.random() * 90000) + 10000}`;

    const newUser = this.usersRepository.create({
      email,
      password: hashPass,
      firstName,
    });
    await this.usersRepository.save(newUser);

    const token = await this.addDeviceAuth(deviceModel, newUser);

    newUser.password = null;

    return { ...newUser, token };
  }

  async addDeviceAuth(deviceModel: string, userId: User) {
    const token = this.createToken(userId);
    const newDevice = this.devicesRepository.create({
      deviceModel,
      userId,
      token,
    });

    await this.devicesRepository.save(newDevice);

    return token;
  }

  createToken(user: User): string {
    const payload = { email: user.firstName, id: user.id };
    return this.jwtService.sign(payload);
  }
}
