import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// Overall KPI Components
import { CurrentMonthComponent } from './components/pages/overall/current-month/current-month.component';
//import { PreviousMonthComponent } from './components/pages/overall/previous-month/previous-month.component';
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
import { BbAnwComponent as AdminBbAnwComponent } from './components/pages/admin/bb-anw/bb-anw.component';
import { OtnOp1Component } from './components/pages/admin/otn-op-1/otn-op-1.component';
import { OtnOp2Component } from './components/pages/admin/otn-op-2/otn-op-2.component';
import { TowerMtceAchievementComponent as AdminTowerMtceAchievementComponent } from './components/pages/admin/tower-mtce-achievement/tower-mtce-achievement.component';
import { AdminTmActivityPlanComponent } from './components/pages/admin/tm-activity-plan/tm-activity-plan.component';
import { AdminRoutineMtncComponent } from './components/pages/admin/routine-mtnc/routine-mtnc.component';
import { EmailServiceComponent } from './components/pages/admin/email-service/email-service.component';
import { FinalTableComponent } from './components/pages/admin/final-table/final-table.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // Overall KPI Routes
  { path: 'overall/current-month', component: CurrentMonthComponent, canActivate: [AuthGuard] },
  //{ path: 'overall/previous-month', component: PreviousMonthComponent, canActivate: [AuthGuard] },
  // Platform KPI Routes
  { path: 'platform/service-fulfilment', component: ServiceFulfilmentComponent, canActivate: [AuthGuard] },
  { path: 'platform/ip-nw-op', component: IpNwOpComponent, canActivate: [AuthGuard] },
  { path: 'platform/bb-anw', component: BbAnwComponent, canActivate: [AuthGuard] },
  { path: 'platform/otn-op', component: OtnOpComponent, canActivate: [AuthGuard] },
  { path: 'platform/tm-activity-plan', component: TmActivityPlanComponent, canActivate: [AuthGuard] },
  { path: 'platform/routine-mtnc', component: RoutineMtncComponent, canActivate: [AuthGuard] },
  { path: 'platform/tower-mtce-achievement', component: TowerMtceAchievementComponent, canActivate: [AuthGuard] },
  // Admin Routes
  { path: 'admin/admin-registration', component: AdminRegistrationComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/user-registration', component: UserRegistrationComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/service-fulfilment', component: AdminServiceFulfilmentComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/region-management', component: RegionManagementComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/ip-nw-op', component: AdminIpNwOpComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/bb-anw', component: AdminBbAnwComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/otn-op-1', component: OtnOp1Component, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/otn-op-2', component: OtnOp2Component, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/tower-mtce-achievement', component: AdminTowerMtceAchievementComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/tm-activity-plan', component: AdminTmActivityPlanComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/routine-mtnc', component: AdminRoutineMtncComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/email-service', component: EmailServiceComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/final-table', component: FinalTableComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: '**', redirectTo: 'dashboard' }
];
