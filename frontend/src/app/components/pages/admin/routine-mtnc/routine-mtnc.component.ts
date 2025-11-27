import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-routine-mtnc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './routine-mtnc.component.html',
  styleUrls: ['./routine-mtnc.component.scss']
})
export class AdminRoutineMtncComponent {
  pageTitle = 'Admin — Routine MTNC';
}

