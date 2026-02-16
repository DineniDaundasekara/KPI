import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// =====================
// Overall KPI Components
// =====================
import { CurrentMonthComponent } from './components/pages/overall/current-month/current-month.component';

// =====================
// Platform KPI Components
// =====================
import { ServiceFulfilmentComponent } from './components/pages/platform/service-fulfilment/service-fulfilment.component';
import { IpNwOpComponent } from './components/pages/platform/ip-nw-op/ip-nw-op.component';
import { BbAnwComponent } from './components/pages/platform/bb-anw/bb-anw.component';
import { OtnOpComponent } from './components/pages/platform/otn-op/otn-op.component';
import { TmActivityPlanComponent } from './components/pages/platform/tm-activity-plan/tm-activity-plan.component';
import { RoutineMtncComponent } from './components/pages/platform/routine-mtnc/routine-mtnc.component';
import {
  TowerMtceAchievementComponent as PlatformTowerMtceAchievementComponent
} from './components/pages/platform/tower-mtce-achievement/tower-mtce-achievement.component';

// =====================
// Admin Components
// =====================
import { AdminRegistrationComponent } from './components/pages/admin/admin-registration/admin-registration.component';
import { UserRegistrationComponent } from './components/pages/admin/user-registration/user-registration.component';
import { AdminServiceFulfilmentComponent } from './components/pages/admin/service-fulfilment/service-fulfilment.component';
import { RegionManagementComponent } from './components/pages/admin/region-management/region-management.component';
import { AdminIpNwOpComponent } from './components/pages/admin/ip-nw-op/ip-nw-op.component';
import { BbAnwComponent as AdminBbAnwComponent } from './components/pages/admin/bb-anw/bb-anw.component';
import { OtnOp1Component } from './components/pages/admin/otn-op-1/otn-op-1.component';
import { OtnOp2Component } from './components/pages/admin/otn-op-2/otn-op-2.component';
import {
  TowerMtceAchievementComponent as AdminTowerMtceAchievementComponent
} from './components/pages/admin/tower-mtce-achievement/tower-mtce-achievement.component';
import { AdminTmActivityPlanComponent } from './components/pages/admin/tm-activity-plan/tm-activity-plan.component';
import { AdminRoutineMtncComponent } from './components/pages/admin/routine-mtnc/routine-mtnc.component';
import { EmailServiceComponent } from './components/pages/admin/email-service/email-service.component';
import { FinalTableComponent } from './components/pages/admin/final-table/final-table.component';

// =====================
// ROUTES
// =====================
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },

  // Overall KPI Routes
  { path: 'overall/current-month', component: CurrentMonthComponent },

  // Platform KPI Routes
  { path: 'platform/service-fulfilment', component: ServiceFulfilmentComponent, canActivate: [MsalGuard] },
  { path: 'platform/ip-nw-op', component: IpNwOpComponent, canActivate: [MsalGuard] },
  { path: 'platform/bb-anw', component: BbAnwComponent, canActivate: [MsalGuard] },
  { path: 'platform/otn-op', component: OtnOpComponent, canActivate: [MsalGuard] },
  { path: 'platform/tm-activity-plan', component: TmActivityPlanComponent, canActivate: [MsalGuard] },
  { path: 'platform/routine-mtnc', component: RoutineMtncComponent, canActivate: [MsalGuard] },
  {
    path: 'platform/tower-mtce-achievement',
    component: PlatformTowerMtceAchievementComponent,
    canActivate: [MsalGuard]
  },

  // Admin Routes
  { path: 'admin/admin-registration', component: AdminRegistrationComponent, canActivate: [MsalGuard] },
  { path: 'admin/user-registration', component: UserRegistrationComponent, canActivate: [MsalGuard] },
  { path: 'admin/service-fulfilment', component: AdminServiceFulfilmentComponent, canActivate: [MsalGuard] },
  { path: 'admin/region-management', component: RegionManagementComponent, canActivate: [MsalGuard] },
  { path: 'admin/ip-nw-op', component: AdminIpNwOpComponent, canActivate: [MsalGuard] },
  { path: 'admin/bb-anw', component: AdminBbAnwComponent, canActivate: [MsalGuard] },
  { path: 'admin/otn-op-1', component: OtnOp1Component, canActivate: [MsalGuard] },
  { path: 'admin/otn-op-2', component: OtnOp2Component, canActivate: [MsalGuard] },
  {
    path: 'admin/tower-mtce-achievement',
    component: AdminTowerMtceAchievementComponent,
    canActivate: [MsalGuard]
  },
  { path: 'admin/tm-activity-plan', component: AdminTmActivityPlanComponent, canActivate: [MsalGuard] },
  { path: 'admin/routine-mtnc', component: AdminRoutineMtncComponent, canActivate: [MsalGuard] },
  { path: 'admin/email-service', component: EmailServiceComponent, canActivate: [MsalGuard] },
  { path: 'admin/final-table', component: FinalTableComponent, canActivate: [MsalGuard] },

  { path: '**', redirectTo: 'dashboard' }
];
