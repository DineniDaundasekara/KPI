import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavOption } from '../../page-config';

interface DropdownSection {
  title: string;
  theme: 'admin' | 'platform' | 'other';
  options: NavOption[];
}

@Component({
  selector: 'app-admin-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dropdown.component.html',
  styleUrls: ['./admin-dropdown.component.scss']
})
export class AdminDropdownComponent implements OnChanges {
  @Input() options: NavOption[] = [];
  @Input() isOpen: boolean = false;
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();
  @Output() selection = new EventEmitter<string>();

  sections: DropdownSection[] = [];

  private readonly adminSet = new Set([
    'Admin Registration',
    'User Registration',
    'Region Management',
    'E-mail Service',
    'KPI Management'
  ]);

  private readonly platformSet = new Set([
    'Service Fulfilment',
    'BB ANW',
    'IP NW OP',
    'OTN OP 1',
    'OTN OP 2'
  ]);

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.buildSections();
    }
  }

  private buildSections(): void {
    const admin: NavOption[] = [];
    const platform: NavOption[] = [];
    const others: NavOption[] = [];

    for (const option of this.options) {
      if (this.adminSet.has(option.label)) {
        admin.push(option);
      } else if (this.platformSet.has(option.label)) {
        platform.push(option);
      } else {
        others.push(option);
      }
    }

    const sections: DropdownSection[] = [
      { title: 'Admin / User / Email / KPI Management', theme: 'admin', options: admin },
      { title: 'Platform Modules', theme: 'platform', options: platform },
      { title: 'Operations & Other Modules', theme: 'other', options: others }
    ];

    this.sections = sections.filter(section => section.options.length > 0);
  }

  onToggleMenu(): void {
    this.toggleMenu.emit();
  }

  onSelection(path: string): void {
    // Navigate to the selected page
    this.router.navigate([path]).then(() => {
      // Close the menu after navigation
      this.closeMenu.emit();
      this.selection.emit(path);
    }).catch((error) => {
      console.error('Navigation error:', error);
      this.closeMenu.emit();
    });
  }
}

