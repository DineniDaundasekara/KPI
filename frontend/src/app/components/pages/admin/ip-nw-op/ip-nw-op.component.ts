import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-ip-nw-op',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ip-nw-op.component.html',
  styleUrls: ['./ip-nw-op.component.scss']
})
export class AdminIpNwOpComponent {
  pageTitle = 'Admin — IP NW OP';
}

