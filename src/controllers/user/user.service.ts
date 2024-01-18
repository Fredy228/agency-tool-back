import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserDevices } from '../../entity/user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserDevices)
    private devicesRepository: Repository<UserDevices>,
    private readonly entityManager: EntityManager,
  ) {}

  async getUser(user: User): Promise<User> {
    user.password = undefined;
    user.devices = undefined;

    return user;
  }
}
