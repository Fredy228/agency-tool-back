import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { Details } from 'express-useragent';

import { User, UserDevices } from '../../entity/user.entity';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { TokenType } from '../../types/token-type';
import { CustomException } from '../../services/custom-exception';
import { checkPassword, hashPassword } from '../../services/hashPassword';
import { PlanEnum } from '../../enum/plan-enum';
import * as process from 'process';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(UserDevices)
    private devicesRepository: Repository<UserDevices>,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly entityManager: EntityManager,
  ) {}

  async signInCredentials({
    email,
    password,
    userAgent,
  }: LoginAuthDto & { userAgent: Details }): Promise<User & TokenType> {
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

    const deviceModel = `${userAgent.platform} ${userAgent.os} ${userAgent.browser}`;

    await this.deleteOldSession(user.devices);

    const tokens = await this.addDeviceAuth(deviceModel, user);

    return { ...user, ...tokens, password: null };
  }

  async signUpCredentials({
    email,
    password,
    userAgent,
    firstName,
  }: RegisterAuthDto & { userAgent: Details }): Promise<User & TokenType> {
    const userFound = await this.usersRepository.findOneBy({ email });
    if (userFound)
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        `Such a user already exists`,
      );

    const deviceModel = `${userAgent.platform} ${userAgent.os} ${userAgent.browser}`;

    const hashPass = await hashPassword(password);

    const name = firstName
      ? firstName
      : `user${Math.floor(Math.random() * 90000) + 10000}`;

    const newUser = this.usersRepository.create({
      email,
      password: hashPass,
      firstName: name,
      settings: {
        plan: PlanEnum.FREE,
        code: null,
        restorePassAt: null,
      },
    });
    await this.usersRepository.save(newUser);

    const tokens = await this.addDeviceAuth(deviceModel, newUser);

    return { ...newUser, ...tokens, password: null };
  }

  async authGoogle(
    user: Pick<User, 'firstName' | 'lastName' | 'image' | 'email'>,
    userAgent: Details,
  ): Promise<User & TokenType> {
    const currentUser = await this.usersRepository.findOne({
      where: { email: user.email },
      relations: ['devices'],
    });

    const deviceModel = `${userAgent.platform} ${userAgent.os} ${userAgent.browser}`;

    if (currentUser) {
      await this.deleteOldSession(currentUser.devices);

      const tokens = await this.addDeviceAuth(deviceModel, currentUser);

      return { ...currentUser, ...tokens, password: null };
    }

    if (!currentUser) {
      const hashPass = await hashPassword(uuidv4());
      const newUser = this.usersRepository.create({
        ...user,
        password: hashPass,
        settings: {
          plan: PlanEnum.FREE,
          code: null,
          restorePassAt: null,
        },
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

  async addDeviceAuth(deviceModel: string, userId: User): Promise<TokenType> {
    const tokens = this.createToken(userId);
    const newDevice = this.devicesRepository.create({
      deviceModel: deviceModel ? deviceModel : null,
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    await this.devicesRepository.save(newDevice);

    return tokens;
  }

  createToken(user: User): TokenType {
    const payload = { email: user.email, id: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '45m' });
    const refreshToken = this.jwtService.sign(payload);
    return { accessToken, refreshToken };
  }

  async sendVerificationCode(user: User): Promise<void> {
    const randomCode = Math.floor(100000 + Math.random() * 900000);

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const newTokens = this.createToken(user);

      await transactionalEntityManager
        .getRepository(User)
        .createQueryBuilder()
        .update(User)
        .set({
          settings: {
            ...user.settings,
            code: {
              value: String(randomCode),
              date: new Date(),
            },
          },
        })
        .where('id = :id', { id: user.id })
        .execute();

      return newTokens;
    });

    try {
      await this.mailerService.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Verification AgencyTool',
        template: 'code',
        context: {
          title: 'Verification email',
          code: randomCode,
        },
      });
    } catch (e) {
      console.log('e', e);
      throw new CustomException(HttpStatus.BAD_REQUEST, `Error send code`);
    }
    return;
  }

  async checkVerificationCode(user: User, code: string) {
    if (new Date().getTime() - user.settings.code.date.getTime() > 600000)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Code expired`);

    if (code !== user.settings.code.value)
      throw new CustomException(HttpStatus.BAD_REQUEST, `Wrong code`);

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const newTokens = this.createToken(user);

        await transactionalEntityManager
          .getRepository(User)
          .createQueryBuilder()
          .update(User)
          .set({
            settings: {
              ...user.settings,
              code: null,
            },
            verified: 1,
          })
          .where('id = :id', { id: user.id })
          .execute();

        return newTokens;
      },
    );
  }
}
