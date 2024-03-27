import {
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CollectionScreen, CustomScreen } from './organization.entity';
import { Dashboard } from './dashboard.entity';
import { Collection } from './collection.entity';

@Entity({ name: 'screen_dashboard' })
export class ScreenDashboard {
  @Index('idx_custom_screen_id')
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CustomScreen, (screen) => screen.screensDashb, {
    onDelete: 'CASCADE',
  })
  screen: CustomScreen;

  @OneToOne(() => Dashboard, (dashboard) => dashboard.screenBuffer, {
    onDelete: 'CASCADE',
  })
  dashboard: Dashboard;
}

@Entity({ name: 'screen_collection' })
export class ScreenCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CollectionScreen, (screen) => screen.screensCollect, {
    onDelete: 'CASCADE',
  })
  screen: CollectionScreen;

  @OneToOne(() => Collection, (collection) => collection.imageBuffer, {
    onDelete: 'CASCADE',
  })
  collection: Collection;
}
