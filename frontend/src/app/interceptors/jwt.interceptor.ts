import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to api url
        const user = this.authService.userValue;
        const isLoggedIn = user && user.token;
        const isAbsoluteUrl = /^https?:\/\//i.test(request.url);
        const isLocalBackend =
            request.url.startsWith('http://localhost:5043') ||
            request.url.startsWith('https://localhost:5043');
        const isApiUrl = !isAbsoluteUrl || isLocalBackend;

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
