import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Link } from './link.entity';
import { Collection } from './collection.entity';
import { ScreenDashboard } from './screens.entity';

@Entity({ name: 'dashboard' })
export class Dashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

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
  password: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  screenUrl: string;

  @Column({ type: 'longblob', nullable: true })
  logoPartnerUrl: Buffer | null;

  @Column({ type: 'varchar', length: 250, nullable: false })
  textOne: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  textTwo: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  textThree: string;

  @Column({
    type: 'simple-json',
    default: null,
  })
  theme: {
    color_main: string;
    color_second: string;
  };

  @ManyToOne(() => Organization, (org) => org.dashboards, {
    onDelete: 'CASCADE',
  })
  orgId: Organization;

  @OneToMany(() => Link, (link) => link.dashbId)
  links: Link[];

  @OneToMany(() => Collection, (collection) => collection.dashbId)
  collections: Collection[];

  @OneToOne(() => ScreenDashboard, (screenDashb) => screenDashb.dashboard, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  screenBuffer: ScreenDashboard;
}
