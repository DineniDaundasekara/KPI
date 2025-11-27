import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bb-anw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bb-anw.component.html',
  styleUrls: ['./bb-anw.component.scss']
})
export class BbAnwComponent {
  pageTitle = 'Platform KPI — BB ANW';
}

