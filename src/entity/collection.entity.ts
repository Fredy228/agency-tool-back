import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dashboard } from './dashboard.entity';

@Entity({ name: 'collection' })
export class Collection {
  @Index('idx_collection_id')
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
}
