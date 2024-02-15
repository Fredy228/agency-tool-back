import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Link } from './link.entity';

@Entity({ name: 'dashboard' })
export class Dashboard {
  @Index()
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

  @Column({ type: 'varchar', length: 250, nullable: true })
  logoPartnerUrl: string;

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

  @Index()
  @ManyToOne(() => Organization, (org) => org.dashboards, {
    onDelete: 'CASCADE',
  })
  orgId: Organization;

  @OneToMany(() => Link, (link) => link.dashbId)
  links: Link[];
}
