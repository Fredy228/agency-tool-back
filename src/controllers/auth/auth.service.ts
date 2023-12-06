import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserDevices } from './auth.entity';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { StatusEnum } from '../../enum/error/StatusEnum';
import { TokenType } from '../../types/token-type';
import { CustomException } from '../../services/custom-exception';
import { checkPassword, hashPassword } from '../../services/hashPassword';

@Injectable()
export class UserService {
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

    await this.deleteOldSession(user.devices);

    const tokens = await this.addDeviceAuth(deviceModel, user);

    return { ...user, ...tokens };
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
        StatusEnum.UNAUTHORIZED,
        `Such a user already exists`,
      );

    const hashPass = await hashPassword(password);

    console.log(firstName);

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

    newUser.password = null;

    return { ...newUser, ...tokens };
  }

  async authGoogle(
    token: string,
    deviceModel: string = null,
  ): Promise<User & TokenType> {
    const decodedToken = await this.jwtService.decode(token);

    const currExp = decodedToken.exp * 1000;
    const currTime = new Date().getTime();

    if (currExp < currTime)
      throw new CustomException(StatusEnum.UNAUTHORIZED, `Not verify(auth)`);

    const currentUser = await this.usersRepository.findOne({
      where: { email: decodedToken.email },
      relations: ['devices'],
    });

    if (currentUser) {
      await this.deleteOldSession(currentUser.devices);

      const tokens = await this.addDeviceAuth(deviceModel, currentUser);

      currentUser.password = null;
      return { ...currentUser, ...tokens };
    }

    if (!currentUser) {
      const hashPass = await hashPassword(uuidv4());
      const newUser = this.usersRepository.create({
        email: decodedToken.email,
        password: hashPass,
        firstName: decodedToken.firstName,
      });

      await this.usersRepository.save(newUser);

      const tokens = await this.addDeviceAuth(deviceModel, newUser);

      newUser.password = null;
      return { ...newUser, ...tokens };
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
