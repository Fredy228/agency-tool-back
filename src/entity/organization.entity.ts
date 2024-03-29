import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Dashboard } from './dashboard.entity';
import { ScreenCollection, ScreenDashboard } from './screens.entity';

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

  @Column({
    name: 'updateAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @Column({ type: 'longblob', nullable: true })
  logoUrl: Buffer | null;

  @OneToMany(() => CustomScreen, (customScreen) => customScreen.orgId)
  customScreens: CustomScreen[];

  @OneToMany(
    () => CollectionScreen,
    (collectionScreen) => collectionScreen.orgId,
  )
  collectionScreens: CollectionScreen[];

  @ManyToOne(() => User, (user) => user.organizations, { onDelete: 'CASCADE' })
  userId: User;

  @OneToMany(() => Dashboard, (dashboard) => dashboard.orgId)
  dashboards: Dashboard[];
}

@Entity({ name: 'custom_screen' })
export class CustomScreen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longblob', nullable: false })
  buffer: Buffer;

  @ManyToOne(() => Organization, (org) => org.customScreens, {
    onDelete: 'CASCADE',
  })
  orgId: Organization;

  @OneToMany(() => ScreenDashboard, (screenDashb) => screenDashb.screen, {
    onDelete: 'NO ACTION',
  })
  screensDashb: ScreenDashboard[];
}

@Entity({ name: 'collection_screen' })
export class CollectionScreen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longblob', nullable: false })
  buffer: Buffer;

  @ManyToOne(() => Organization, (org) => org.collectionScreens, {
    onDelete: 'CASCADE',
  })
  orgId: Organization;

  @OneToMany(
    () => ScreenCollection,
    (screenCollection) => screenCollection.screen,
    {
      onDelete: 'NO ACTION',
    },
  )
  screensCollect: ScreenCollection[];
}
