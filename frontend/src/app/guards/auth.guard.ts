import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
class PermissionsService {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const user = this.authService.userValue;
        if (user) {
            // check if route is restricted by role
            const allowedRoles = next.data['roles'] as Array<string>;
            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(user.role)) {
                    // role not authorised so redirect to home page
                    this.router.navigate(['/']);
                    return false;
                }
            }
            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    return inject(PermissionsService).canActivate(next, state);
}
