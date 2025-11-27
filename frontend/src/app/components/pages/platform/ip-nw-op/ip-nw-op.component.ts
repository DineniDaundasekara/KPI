import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ip-nw-op',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ip-nw-op.component.html',
  styleUrls: ['./ip-nw-op.component.scss']
})
export class IpNwOpComponent {
  pageTitle = 'Platform KPI — IP NW OP';
}

