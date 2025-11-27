import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-final-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './final-table.component.html',
  styleUrls: ['./final-table.component.scss']
})
export class FinalTableComponent {
  pageTitle = 'Admin — Final Table';
}

