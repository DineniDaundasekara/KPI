import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// Overall KPI Components
import { CurrentMonthComponent } from './components/pages/overall/current-month/current-month.component';
import { PreviousMonthComponent } from './components/pages/overall/previous-month/previous-month.component';
// Platform KPI Components
import { ServiceFulfilmentComponent } from './components/pages/platform/service-fulfilment/service-fulfilment.component';
import { IpNwOpComponent } from './components/pages/platform/ip-nw-op/ip-nw-op.component';
import { BbAnwComponent } from './components/pages/platform/bb-anw/bb-anw.component';
import { OtnOpComponent } from './components/pages/platform/otn-op/otn-op.component';
import { TmActivityPlanComponent } from './components/pages/platform/tm-activity-plan/tm-activity-plan.component';
import { RoutineMtncComponent } from './components/pages/platform/routine-mtnc/routine-mtnc.component';
import { TowerMtceAchievementComponent } from './components/pages/platform/tower-mtce-achievement/tower-mtce-achievement.component';
// Admin Components
import { AdminRegistrationComponent } from './components/pages/admin/admin-registration/admin-registration.component';
import { UserRegistrationComponent } from './components/pages/admin/user-registration/user-registration.component';
import { AdminServiceFulfilmentComponent } from './components/pages/admin/service-fulfilment/service-fulfilment.component';
import { RegionManagementComponent } from './components/pages/admin/region-management/region-management.component';
import { AdminIpNwOpComponent } from './components/pages/admin/ip-nw-op/ip-nw-op.component';
import { AdminBbAnwComponent } from './components/pages/admin/bb-anw/bb-anw.component';
import { OtnOp1Component } from './components/pages/admin/otn-op-1/otn-op-1.component';
import { OtnOp2Component } from './components/pages/admin/otn-op-2/otn-op-2.component';
import { AdminTowerMtceAchievementComponent } from './components/pages/admin/tower-mtce-achievement/tower-mtce-achievement.component';
import { AdminTmActivityPlanComponent } from './components/pages/admin/tm-activity-plan/tm-activity-plan.component';
import { AdminRoutineMtncComponent } from './components/pages/admin/routine-mtnc/routine-mtnc.component';
import { EmailServiceComponent } from './components/pages/admin/email-service/email-service.component';
import { FinalTableComponent } from './components/pages/admin/final-table/final-table.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  // Overall KPI Routes
  { path: 'overall/current-month', component: CurrentMonthComponent },
  { path: 'overall/previous-month', component: PreviousMonthComponent },
  // Platform KPI Routes
  { path: 'platform/service-fulfilment', component: ServiceFulfilmentComponent },
  { path: 'platform/ip-nw-op', component: IpNwOpComponent },
  { path: 'platform/bb-anw', component: BbAnwComponent },
  { path: 'platform/otn-op', component: OtnOpComponent },
  { path: 'platform/tm-activity-plan', component: TmActivityPlanComponent },
  { path: 'platform/routine-mtnc', component: RoutineMtncComponent },
  { path: 'platform/tower-mtce-achievement', component: TowerMtceAchievementComponent },
  // Admin Routes
  { path: 'admin/admin-registration', component: AdminRegistrationComponent },
  { path: 'admin/user-registration', component: UserRegistrationComponent },
  { path: 'admin/service-fulfilment', component: AdminServiceFulfilmentComponent },
  { path: 'admin/region-management', component: RegionManagementComponent },
  { path: 'admin/ip-nw-op', component: AdminIpNwOpComponent },
  { path: 'admin/bb-anw', component: AdminBbAnwComponent },
  { path: 'admin/otn-op-1', component: OtnOp1Component },
  { path: 'admin/otn-op-2', component: OtnOp2Component },
  { path: 'admin/tower-mtce-achievement', component: AdminTowerMtceAchievementComponent },
  { path: 'admin/tm-activity-plan', component: AdminTmActivityPlanComponent },
  { path: 'admin/routine-mtnc', component: AdminRoutineMtncComponent },
  { path: 'admin/email-service', component: EmailServiceComponent },
  { path: 'admin/final-table', component: FinalTableComponent },
  { path: '**', redirectTo: 'dashboard' }
];