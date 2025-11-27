import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-bb-anw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bb-anw.component.html',
  styleUrls: ['./bb-anw.component.scss']
})
export class AdminBbAnwComponent {
  pageTitle = 'Admin — BB ANW';
}

