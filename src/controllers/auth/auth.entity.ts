import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'user' })
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'tinyint', nullable: true })
  sex: number;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  verified: number;

  @OneToMany(() => UserDevices, (device) => device.userId)
  devices: UserDevices[];
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

  // @Column({ name: 'userId' })
  // userId: number;

  @ManyToOne(() => User, (user) => user.devices)
  userId: User;
}
