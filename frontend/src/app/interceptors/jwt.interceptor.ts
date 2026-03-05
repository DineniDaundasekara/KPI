/* File: jwt.interceptor.ts
   Description: JWT authentication HTTP interceptor
   Purpose: Automatically adds JWT token to outgoing HTTP requests
   if user is authenticated and request is to local backend.
*/

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/* ========== JWT INTERCEPTOR ========== */

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    /* Intercept HTTP requests to add authorization header with JWT */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        /* Get current user and token */
        const user = this.authService.userValue;
        /* Check if user is authenticated */
        const isLoggedIn = user && user.token;
        /* Check if request URL is absolute */
        const isAbsoluteUrl = /^https?:\/\//i.test(request.url);
        /* Check if request is to local backend */
        const isLocalBackend =
            request.url.startsWith('http://localhost:5043') ||
            request.url.startsWith('https://localhost:5043');
        /* API request if relative or local backend */
        const isApiUrl = !isAbsoluteUrl || isLocalBackend;

        /* Add JWT token to authenticated API requests */
        if (isLoggedIn && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${user.token}`
                }
            });
        }

        return next.handle(request);
    }
}
