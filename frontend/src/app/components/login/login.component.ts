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
        console.log('[Login] Checking for existing Azure session and redirect results...');

        // Always handle redirect promise first to capture tokens from Azure
        this.msalService.instance.handleRedirectPromise().then(result => {
            if (result) {
                console.log('[Login] Redirect success:', result.account.username);
                this.msalService.instance.setActiveAccount(result.account);
                this.setAzureState(result.account.username);
                return; // Stop here if we just got a redirect result
            }

            // If no redirect result, check for existing active account
            const activeAccount = this.msalService.instance.getActiveAccount();
            const allAccounts = this.msalService.instance.getAllAccounts();

            if (activeAccount) {
                console.log('[Login] Active account found:', activeAccount.username);
                this.setAzureState(activeAccount.username);
            } else if (allAccounts.length > 0) {
                console.log('[Login] No active account, setting first available:', allAccounts[0].username);
                this.msalService.instance.setActiveAccount(allAccounts[0]);
                this.setAzureState(allAccounts[0].username);
            }
        }).catch(err => {
            console.error('[Login] MSAL handleRedirectPromise error:', err);
            this.error = 'Azure login failed to process redirect';
        });

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
        console.log('[Login] Initiating loginRedirect...');
        this.msalService.loginRedirect(loginRequest);
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
