import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { EventType } from '@azure/msal-browser';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    constructor(private authService: MsalService, private router: Router) { }

    ngOnInit() {
        if (this.authService.instance.getAllAccounts().length > 0) {
            this.router.navigate(['/dashboard']);
        }

        this.authService.instance.addEventCallback((event) => {
            if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
                if (this.authService.instance.getAllAccounts().length > 0) {
                    this.router.navigate(['/dashboard']);
                }
            }
        });
    }

    login() {
        this.authService.loginRedirect();
    }
}
