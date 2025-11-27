import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-title',
  standalone: true,
  imports: [],
  templateUrl: './header-title.component.html',
  styleUrls: ['./header-title.component.scss']
})
export class HeaderTitleComponent {
  @Input() title: string = 'KPI Dashboard';
}

