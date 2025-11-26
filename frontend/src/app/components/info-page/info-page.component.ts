import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})
export class InfoPageComponent {
  protected readonly pageTitle: string;
  protected readonly description: string;

  constructor(private readonly route: ActivatedRoute) {
    this.pageTitle = this.route.snapshot.data['title'] ?? 'Details';
    this.description =
      this.route.snapshot.data['description'] ??
      'Content for this section will be available soon.';
  }
}

