import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-previous-month',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './previous-month.component.html',
  styleUrls: ['./previous-month.component.scss']
})
export class PreviousMonthComponent {
  pageTitle = 'Overall KPI — Previous Month';
}

