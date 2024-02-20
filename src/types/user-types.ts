import { PlanEnum } from '../enum/plan-enum';

export type UserSettingsType = {
  restorePassAt: Date | null;
  plan: PlanEnum;
  code: {
    date: Date;
    value: string;
  } | null;
};
