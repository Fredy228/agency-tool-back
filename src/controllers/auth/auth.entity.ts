import {
  Column,
  Entity,
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

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'tinyint', nullable: true })
  sex: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  image: string;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  verified: number;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  firstSettings: number;

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

  @Column({ type: 'varchar', length: 250, nullable: false })
  token: string;

  @ManyToOne(() => User, (user) => user.devices)
  userId: User;
}
