import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavOption } from '../../page-config';

@Component({
  selector: 'app-overall-kpi-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overall-kpi-dropdown.component.html',
  styleUrls: ['./overall-kpi-dropdown.component.scss']
})
export class OverallKpiDropdownComponent {
  @Input() options: NavOption[] = [];
  @Input() isOpen: boolean = false;
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();
  @Output() selection = new EventEmitter<string>();

  constructor(private router: Router) {}

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

