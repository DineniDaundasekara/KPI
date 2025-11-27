import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavOption } from '../../page-config';

@Component({
  selector: 'app-admin-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dropdown.component.html',
  styleUrls: ['./admin-dropdown.component.scss']
})
export class AdminDropdownComponent {
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

