import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import { adminNavOptions, overallNavOptions, platformNavOptions } from './page-config';
import { HeaderTitleComponent } from './components/header-title/header-title.component';
import { DashboardButtonComponent } from './components/dashboard-button/dashboard-button.component';
import { OverallKpiDropdownComponent } from './components/overall-kpi-dropdown/overall-kpi-dropdown.component';
import { PlatformKpiDropdownComponent } from './components/platform-kpi-dropdown/platform-kpi-dropdown.component';
import { AdminDropdownComponent } from './components/admin-dropdown/admin-dropdown.component';
import { LogoutButtonComponent } from './components/logout-button/logout-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderTitleComponent,
    DashboardButtonComponent,
    OverallKpiDropdownComponent,
    PlatformKpiDropdownComponent,
    AdminDropdownComponent,
    LogoutButtonComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('Network Key Performance Indicator (KPI)');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly userName = signal<string>('Guest');
  protected readonly overallOptions = overallNavOptions;
  protected readonly platformOptions = platformNavOptions;
  protected readonly adminOptions = adminNavOptions;

  constructor(private msalService: MsalService, private router: Router) { }

  ngOnInit(): void {
    // Get the active account
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      const account = accounts[0];
      this.userName.set(account.name || account.username || 'User');
    } else {
      // Listen for account changes
      this.msalService.instance.addEventCallback((event: EventMessage) => {
        if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
          const accounts = this.msalService.instance.getAllAccounts();
          if (accounts.length > 0) {
            const account = accounts[0];
            this.userName.set(account.name || account.username || 'User');
          }
        }
      });
    }
  }

  protected handleSelection(path: string): void {
    // Navigation is handled by the dropdown components
  }

  protected logout(): void {
    console.log('[Navigation] Logout requested');
    this.closeMenus();
  }

  protected toggleMenu(menu: string): void {
    this.openMenu.update((current) => (current === menu ? null : menu));
  }

  protected closeMenus(): void {
    this.openMenu.set(null);
  }

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (target && target.closest('.dropdown')) {
      return;
    }
    this.closeMenus();
  }
}