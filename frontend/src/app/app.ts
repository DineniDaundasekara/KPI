import { Component, HostListener, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, NavigationError, Event as RouterEvent } from '@angular/router';
// import { MsalService } from '@azure/msal-angular'; // Removed
import { adminNavOptions, overallNavOptions, platformNavOptions } from './page-config';
import { HeaderTitleComponent } from './components/header-title/header-title.component';
import { DashboardButtonComponent } from './components/dashboard-button/dashboard-button.component';
import { OverallKpiDropdownComponent } from './components/overall-kpi-dropdown/overall-kpi-dropdown.component';
import { PlatformKpiDropdownComponent } from './components/platform-kpi-dropdown/platform-kpi-dropdown.component';
import { AdminDropdownComponent } from './components/admin-dropdown/admin-dropdown.component';
import { LogoutButtonComponent } from './components/logout-button/logout-button.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { AuthService } from './services/auth.service';

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
    LogoutButtonComponent,
    HasRoleDirective
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('Network Key Performance Indicator (KPI)');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly userName = signal<string>('Guest');
  protected readonly overallOptions = overallNavOptions;
  protected readonly platformOptions = platformNavOptions;
  protected readonly adminOptions = adminNavOptions;
  protected currentUrl = '';
  protected navError: string | null = null;
  protected lastError: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.router.events.subscribe((ev: RouterEvent) => {
      if (ev instanceof NavigationEnd) {
        this.currentUrl = ev.urlAfterRedirects;
        this.navError = null;
      }
      if (ev instanceof NavigationError) {
        this.navError = String(ev.error || 'NavigationError');
      }
    });

    // Get user from AuthService
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName.set(user.name);
      } else {
        this.userName.set('Guest');
      }
    });
  }

  protected handleSelection(path: string): void {
    // Navigation is handled by the dropdown components
  }

  protected logout(): void {
    console.log('[Navigation] Logout requested');
    this.authService.logout();
    this.closeMenus();
  }

  protected get isLoginPage(): boolean {
    return this.currentUrl === '/login' || this.currentUrl === '/';
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