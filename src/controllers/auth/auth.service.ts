import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Details } from 'express-useragent';

import { User, UserDevices } from '../../entity/user.entity';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { TokenType } from '../../types/token-type';
import { CustomException } from '../../services/custom-exception';
import { checkPassword, hashPassword } from '../../services/hashPassword';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(UserDevices)
    private devicesRepository: Repository<UserDevices>,
    private jwtService: JwtService,
    private readonly entityManager: EntityManager,
  ) {}

  async signInCredentials({
    email,
    password,
    deviceModel,
  }: LoginAuthDto): Promise<User & TokenType> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['devices'],
    });

    if (!user)
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        `Username or password is wrong`,
      );
    const isValidPass = await checkPassword(password, user.password);

    if (!isValidPass)
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        `Username or password is wrong`,
      );

    await this.deleteOldSession(user.devices);

    const tokens = await this.addDeviceAuth(deviceModel, user);

    return { ...user, ...tokens, password: null };
  }

  async signUpCredentials({
    email,
    password,
    deviceModel,
    firstName,
  }: RegisterAuthDto): Promise<User & TokenType> {
    const userFound = await this.usersRepository.findOneBy({ email });
    if (userFound)
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        `Such a user already exists`,
      );

    const hashPass = await hashPassword(password);

    const name = firstName
      ? firstName
      : `user${Math.floor(Math.random() * 90000) + 10000}`;

    const newUser = this.usersRepository.create({
      email,
      password: hashPass,
      firstName: name,
    });
    await this.usersRepository.save(newUser);

    const tokens = await this.addDeviceAuth(deviceModel, newUser);

    return { ...newUser, ...tokens, password: null };
  }

  async authGoogle(
    token: string,
    deviceModel: string = null,
  ): Promise<User & TokenType> {
    const decodedToken = await this.jwtService.decode(token);

    const currExp = decodedToken.exp * 1000;
    const currTime = new Date().getTime();

    if (currExp < currTime)
      throw new CustomException(HttpStatus.UNAUTHORIZED, `Not verify(auth)`);

    const currentUser = await this.usersRepository.findOne({
      where: { email: decodedToken.email },
      relations: ['devices'],
    });

    if (currentUser) {
      await this.deleteOldSession(currentUser.devices);

      const tokens = await this.addDeviceAuth(deviceModel, currentUser);

      return { ...currentUser, ...tokens, password: null };
    }

    if (!currentUser) {
      const hashPass = await hashPassword(uuidv4());
      const newUser = this.usersRepository.create({
        email: decodedToken.email,
        password: hashPass,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        image: decodedToken.image,
      });

      await this.usersRepository.save(newUser);

      const tokens = await this.addDeviceAuth(deviceModel, newUser);

      return { ...newUser, ...tokens, password: null };
    }
  }

  async refreshToken(
    user: User,
    currentDevice: UserDevices,
  ): Promise<TokenType> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const newTokens = this.createToken(user);

        await transactionalEntityManager
          .getRepository(UserDevices)
          .createQueryBuilder()
          .update(UserDevices)
          .set({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
          })
          .where('id = :id', { id: currentDevice.id })
          .execute();

        return newTokens;
      },
    );
  }

  async logout(currentDevice: UserDevices): Promise<void> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .getRepository(UserDevices)
          .createQueryBuilder()
          .delete()
          .where('id = :id', { id: currentDevice.id })
          .execute();
      },
    );
  }

  async deleteOldSession(devices: UserDevices[]) {
    return Promise.all(
      devices.map(async (device) => {
        const decodedToken = await this.jwtService.decode(device.refreshToken);

        const currExp = decodedToken.exp * 1000;
        const currTime = new Date().getTime();

        if (currExp > currTime) return null;

        return this.entityManager.transaction(
          async (transactionalEntityManager) => {
            await transactionalEntityManager
              .getRepository(UserDevices)
              .createQueryBuilder()
              .delete()
              .from(UserDevices)
              .where('id = :id', { id: device.id })
              .execute();
          },
        );
      }),
    );
  }

  async userAgent(
    currDevice: UserDevices,
    userAgent: Details,
  ): Promise<string> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const device = `${userAgent.platform} ${userAgent.os} ${userAgent.browser}`;

        await transactionalEntityManager
          .getRepository(UserDevices)
          .createQueryBuilder()
          .update(UserDevices)
          .set({
            deviceModel: device,
          })
          .where('id = :id', { id: currDevice.id })
          .execute();

        return device;
      },
    );
  }

  async addDeviceAuth(deviceModel: string, userId: User): Promise<TokenType> {
    const tokens = this.createToken(userId);
    const newDevice = this.devicesRepository.create({
      deviceModel,
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    await this.devicesRepository.save(newDevice);

    return tokens;
  }

  createToken(user: User): TokenType {
    const payload = { email: user.firstName, id: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload);
    return { accessToken, refreshToken };
  }
}
