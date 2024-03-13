import {
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomScreen } from './organization.entity';
import { Dashboard } from './dashboard.entity';

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
