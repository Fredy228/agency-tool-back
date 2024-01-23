import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Dashboard } from './dashboard.entity';

@Entity({ name: 'organization' })
export class Organization {
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

  @Column({ type: 'varchar', length: 250, nullable: true })
  logoUrl: string;

  @Column({
    type: 'simple-array',
    default: null,
  })
  customScreens: string[];

  @ManyToOne(() => User, (user) => user.organizations, { onDelete: 'CASCADE' })
  userId: User;

  @OneToMany(() => Dashboard, (dashboard) => dashboard.orgId)
  dashboards: Dashboard[];
}
