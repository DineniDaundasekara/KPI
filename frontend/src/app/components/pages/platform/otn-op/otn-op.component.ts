import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otn-op',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otn-op.component.html',
  styleUrls: ['./otn-op.component.scss']
})
export class OtnOpComponent {
  pageTitle = 'Platform KPI — OTN OP';
}

