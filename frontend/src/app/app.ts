import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { adminNavOptions, overallNavOptions, platformNavOptions } from './page-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('KPI Dashboard');
  protected readonly openMenu = signal<string | null>(null);
  protected readonly overallOptions = overallNavOptions;
  protected readonly platformOptions = platformNavOptions;
  protected readonly adminOptions = adminNavOptions;

  constructor(private readonly router: Router) {}

  protected handleSelection(path: string): void {
    this.router.navigate(['/', path]);
    this.closeMenus();
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