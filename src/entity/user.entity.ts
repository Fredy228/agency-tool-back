import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Organization } from './organization.entity';
import { PlanEnum } from '../enum/plan-enum';

@Entity({ name: 'user' })
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
    type: 'simple-json',
    default: null,
  })
  settings: {
    restorePassAt: Date | null;
    plan: PlanEnum;
  };

  @Column({
    name: 'createAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @OneToMany(() => UserDevices, (device) => device.userId)
  devices: UserDevices[];

  @OneToMany(() => Organization, (organization) => organization.userId)
  organizations: Organization[];
}

@Entity({ name: 'user_devices' })
export class UserDevices {
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
