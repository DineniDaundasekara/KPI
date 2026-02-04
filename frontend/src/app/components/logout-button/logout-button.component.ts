import { Component, Output, EventEmitter } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [],
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.scss']
})
export class LogoutButtonComponent {
  @Output() logout = new EventEmitter<void>();

  constructor(private msalService: MsalService) { }

  onLogout(): void {
    this.msalService.logoutRedirect();
    this.logout.emit();
  }
}

