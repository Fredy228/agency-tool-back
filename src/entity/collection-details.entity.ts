import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Collection } from './collection.entity';
import { JsonTransformer } from '@anchan828/typeorm-transformers';
import { LinkType } from '../types/collection-links';

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

  @ManyToOne(() => Collection, (collection) => collection.sections, {
    onDelete: 'CASCADE',
  })
  collection: Collection;
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
  links: LinkType[];

  @ManyToOne(() => CollectionSection, (section) => section.folders, {
    onDelete: 'CASCADE',
  })
  section: CollectionSection;
}
