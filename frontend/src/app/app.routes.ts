import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InfoPageComponent } from './components/info-page/info-page.component';
import { infoPages } from './page-config';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  ...infoPages.map(({ path, title }) => ({
    path,
    component: InfoPageComponent,
    data: { title }
  })),
  { path: '**', redirectTo: 'dashboard' }
];