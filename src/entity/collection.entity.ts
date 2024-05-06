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
import { CollectionSection } from './collection-details.entity';

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

  @OneToMany(() => CollectionSection, (section) => section.collection)
  sections: CollectionSection[];
}
