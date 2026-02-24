import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { first } from 'rxjs/operators';
import { loginRequest } from '../../auth-config';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    serviceId = '';
    loading = false;
    error = '';
    isAzureAuthenticated = false;
    azureEmail = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private msalService: MsalService,
        private msalBroadcastService: MsalBroadcastService
    ) { }

    ngOnInit(): void {
        console.log('[Login] Checking for existing Azure session...');
        const activeAccount = this.msalService.instance.getActiveAccount();
        const allAccounts = this.msalService.instance.getAllAccounts();

        if (activeAccount) {
            console.log('[Login] Active account found:', activeAccount.username);
            this.setAzureState(activeAccount.username);
        } else if (allAccounts.length > 0) {
            console.log('[Login] No active account, but account(s) exist. Setting first as active:', allAccounts[0].username);
            this.msalService.instance.setActiveAccount(allAccounts[0]);
            this.setAzureState(allAccounts[0].username);
        } else {
            console.log('[Login] No Azure session found.');
        }

        // Redirect if already logged in to our backend
        if (this.authService.userValue) {
            this.router.navigate(['/dashboard']);
        }
    }

    private setAzureState(email: string) {
        this.isAzureAuthenticated = true;
        this.azureEmail = email;
    }

    login() {
        this.loading = true;
        this.error = '';

        if (this.isAzureAuthenticated) {
            this.loginWithAzureStep2();
        } else {
            this.loginWithServiceIdOnly();
        }
    }

    private loginWithServiceIdOnly() {
        this.authService.login(this.serviceId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.handleLoginSuccess();
                },
                error: () => {
                    this.error = 'Invalid Service ID or Login Failed';
                    this.loading = false;
                }
            });
    }

    private loginWithAzureStep2() {
        this.authService.verifyAzureLogin(this.azureEmail, this.serviceId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.handleLoginSuccess();
                },
                error: (error) => {
                    console.error('Azure Verification Error:', error);
                    this.error = error.error?.message || 'Service ID does not match Microsoft account';
                    this.loading = false;
                }
            });
    }

    signInWithAzure() {
        this.loading = true;
        this.error = '';

        this.msalService.loginPopup(loginRequest)
            .subscribe({
                next: (result: AuthenticationResult) => {
                    console.log('[Login] Azure Popup Success:', result.account.username);
                    const email = result.account.username;
                    if (email) {
                        this.msalService.instance.setActiveAccount(result.account);
                        this.setAzureState(email);
                        this.loading = false;
                    } else {
                        this.error = 'Could not get user email from Microsoft account';
                        this.loading = false;
                    }
                },
                error: (error) => {
                    console.error('[Login] Azure Login Error:', error);
                    this.error = 'Azure Login Failed or Cancelled';
                    this.loading = false;
                }
            });
    }

    cancelAzure() {
        this.isAzureAuthenticated = false;
        this.azureEmail = '';
        this.error = '';
    }

    private handleLoginSuccess() {
        // get return url from route parameters or default to '/'
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
    }
}
