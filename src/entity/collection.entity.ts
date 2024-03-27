import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { ScreenCollection } from './screens.entity';
import { Link } from './link.entity';
import { JsonTransformer } from '@anchan828/typeorm-transformers';
import { UserSettingsType } from '../types/user-types';
import { PlanEnum } from '../enum/plan-enum';
import { LinkType } from '../types/collection-links';

@Entity({ name: 'collection' })
export class Collection {
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
  image: string;

  @ManyToOne(() => Dashboard, (dashb) => dashb.collections, {
    onDelete: 'CASCADE',
  })
  dashbId: Dashboard;

  @OneToOne(
    () => ScreenCollection,
    (screenCollection) => screenCollection.collection,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn()
  imageBuffer: ScreenCollection;

  @OneToOne(
    () => CollectionDetails,
    (collectionDetails) => collectionDetails.collection,
    {
      onDelete: 'SET NULL',
    },
  )
  details: CollectionDetails;
}

@Entity({ name: 'collection_details' })
export class CollectionDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Collection, (collection) => collection.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  collection: Collection;

  @OneToMany(() => CollectionSection, (section) => section.details)
  sections: CollectionSection[];
}

@Entity({ name: 'collection_section' })
export class CollectionSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @OneToMany(() => CollectionFolder, (folder) => folder.section)
  folders: CollectionFolder[];

  @ManyToOne(
    () => CollectionDetails,
    (collectionDetails) => collectionDetails.sections,
    {
      onDelete: 'CASCADE',
    },
  )
  details: CollectionDetails;
}

@Entity({ name: 'collection_folder' })
export class CollectionFolder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'longtext',
    nullable: true,
    transformer: new JsonTransformer<LinkType[]>([]),
  })
  settings: LinkType[];

  @ManyToOne(() => CollectionSection, (section) => section.folders, {
    onDelete: 'CASCADE',
  })
  section: CollectionSection;
}
