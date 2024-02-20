import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Organization } from './organization.entity';
import { PlanEnum } from '../enum/plan-enum';
import { JsonTransformer } from '@anchan828/typeorm-transformers';
import { UserSettingsType } from '../types/user-types';

@Entity({ name: 'user' })
@Unique(['email'])
export class User {
  @Index('idx_user_id')
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_user_email')
  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'tinyint', nullable: true })
  sex: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  image: string;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  verified: number;

  @Column({
    type: 'varchar',
    width: 255,
    nullable: true,
    transformer: new JsonTransformer<UserSettingsType>({
      restorePassAt: null,
      plan: PlanEnum.FREE,
      code: null,
    }),
  })
  settings: UserSettingsType;

  @Column({
    name: 'createAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @Column({
    name: 'updateAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @OneToMany(() => UserDevices, (device) => device.userId)
  devices: UserDevices[];

  @OneToMany(() => Organization, (organization) => organization.userId)
  organizations: Organization[];
}

@Entity({ name: 'user_devices' })
export class UserDevices {
  @Index('idx_devices_id')
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'deviceModel', type: 'varchar', length: 100, nullable: true })
  deviceModel: string;

  @Column({
    name: 'createAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @Column({
    name: 'updateAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @Column({ type: 'varchar', length: 250, nullable: false })
  accessToken: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  refreshToken: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  userId: User;
}
