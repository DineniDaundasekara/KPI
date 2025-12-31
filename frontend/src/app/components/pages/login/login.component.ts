import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    constructor(
        private msalService: MsalService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.checkLoginState();
    }

    checkLoginState(): void {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
            this.router.navigate(['/dashboard']);
        }
    }

    login(): void {
        this.msalService.loginRedirect();
    }
}
