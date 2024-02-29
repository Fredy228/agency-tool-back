import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Dashboard } from './dashboard.entity';

@Entity({ name: 'organization' })
export class Organization {
  @Index('idx_organization_id')
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

  @Column({ type: 'longblob', nullable: true })
  logoUrl: Buffer | null;

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
