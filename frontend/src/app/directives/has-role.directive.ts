import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit {
    @Input() appHasRole: string[] = [];

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const userRole = this.authService.getRole();

        // If no roles defined, show by default (or hide? usually means public)
        if (!this.appHasRole || this.appHasRole.length === 0) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            return;
        }

        // Check if user role is in allowed roles
        if (userRole && this.appHasRole.includes(userRole)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
