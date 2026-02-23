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
  @Output() closeMenu = new EventEmitter<void>();
  @Output() selection = new EventEmitter<string>();

  constructor(private router: Router) {}

  onNavigate(): void {
    const target = this.options[0]?.path;
    if (!target) {
      return;
    }

    this.router.navigate([target]).then(() => {
      this.closeMenu.emit();
      this.selection.emit(target);
    }).catch((error) => {
      console.error('Navigation error:', error);
      this.closeMenu.emit();
    });
  }
}

