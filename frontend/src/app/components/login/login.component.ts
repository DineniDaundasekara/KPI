import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    serviceId = '';
    loading = false;
    error = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        // Redirect if already logged in
        if (this.authService.userValue) {
            this.router.navigate(['/dashboard']);
        }
    }

    login() {
        this.loading = true;
        this.error = '';

        this.authService.login(this.serviceId)
            .pipe(first())
            .subscribe({
                next: () => {
                    // get return url from route parameters or default to '/'
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
                    this.router.navigate([returnUrl]);
                },
                error: error => {
                    this.error = 'Invalid Service ID or Login Failed';
                    this.loading = false;
                }
            });
    }
}
