import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-routine-mtnc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './routine-mtnc.component.html',
  styleUrls: ['./routine-mtnc.component.scss']
})
export class RoutineMtncComponent {
  pageTitle = 'Platform KPI — Routine MTNC';
}

