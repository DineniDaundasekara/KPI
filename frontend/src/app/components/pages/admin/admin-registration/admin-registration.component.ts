import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';

interface AdminUser {
  id: string;
  name: string;
  serviceNumber: string;
  role?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  pages?: string[];
}

interface CreateAdminRequest {
  name: string;
  serviceNumber: string;
  role?: string;
  pages?: string[];
}

@Component({
  selector: 'app-admin-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './admin-registration.component.html',
  styleUrls: ['./admin-registration.component.scss'],
})
export class AdminRegistrationComponent implements OnInit {
  pageTitle = 'Network KPI Monitoring';
  sectionTitle = 'Admin Management';

  adminForm!: FormGroup;

  admins: AdminUser[] = [];
  filteredAdmins: AdminUser[] = [];

  successMessage = '';
  errorMessage = '';
  searchTerm = '';
  isSubmitting = false;
  isFormVisible = false;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // ✅ Change this if your backend port changes
  private readonly apiBase = 'http://localhost:5043/api/users';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAdminsFromApi();
  }

  private buildForm(): void {
    this.adminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      serviceNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]],
      // Optional: if you later want role selection from UI
      role: ['admin'],
    });
  }

  // ✅ Load from backend
  loadAdminsFromApi(): void {
    this.errorMessage = '';
    this.http.get<AdminUser[]>(`${this.apiBase}/admins`).subscribe({
      next: (data) => {
        this.admins = data ?? [];
        this.applyFilters();
      },
      error: (err) => {
        this.errorMessage = this.getApiError(err, 'Failed to load admins.');
      },
    });
  }

  toggleFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
  }

  get nameCtrl() {
    return this.adminForm.get('name');
  }

  get serviceNumberCtrl() {
    return this.adminForm.get('serviceNumber');
  }

  getActiveCount(): number {
    return this.admins.filter((a) => a.isActive).length;
  }

  getInactiveCount(): number {
    return this.admins.filter((a) => !a.isActive).length;
  }

  // ✅ CREATE ADMIN (POST)
  onSubmit(): void {
    if (this.adminForm.invalid || this.isSubmitting) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const payload: CreateAdminRequest = {
      name: (this.adminForm.get('name')?.value ?? '').trim(),
      serviceNumber: (this.adminForm.get('serviceNumber')?.value ?? '').trim(),
      role: (this.adminForm.get('role')?.value ?? 'admin')?.trim() || 'admin',
      pages: [], // your UI currently doesn’t collect pages, so keep empty
    };

    this.http.post<AdminUser>(`${this.apiBase}/admins`, payload).subscribe({
      next: (created) => {
        // add to top
        this.admins = [created, ...this.admins];
        this.applyFilters();

        this.successMessage = `Admin "${created.name}" created successfully.`;
        this.adminForm.reset({ role: 'admin' });
        this.isSubmitting = false;

        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = this.getApiError(err, 'Failed to create admin.');
        this.isSubmitting = false;
      },
    });
  }

  // ✅ DELETE (DELETE)
  deleteAdmin(id: string): void {
    const admin = this.admins.find((a) => a.id === id);
    if (!admin) return;

    if (!window.confirm(`Delete admin "${admin.name}" (${admin.serviceNumber})?`)) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.http.delete(`${this.apiBase}/${id}`).subscribe({
      next: () => {
        this.admins = this.admins.filter((a) => a.id !== id);
        this.applyFilters();

        this.successMessage = `Admin "${admin.name}" deleted successfully.`;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = this.getApiError(err, 'Failed to delete admin.');
      },
    });
  }

  // ✅ TOGGLE ACTIVE/INACTIVE (PATCH)
  toggleStatus(admin: AdminUser): void {
    this.errorMessage = '';
    this.successMessage = '';

    // optimistic update (instant UI)
    const oldValue = admin.isActive;
    admin.isActive = !admin.isActive;
    this.applyFilters();

    this.http.patch(`${this.apiBase}/${admin.id}/status`, {}).subscribe({
      next: () => {
        this.successMessage = `Admin "${admin.name}" ${admin.isActive ? 'activated' : 'deactivated'}.`;
        setTimeout(() => (this.successMessage = ''), 2000);
      },
      error: (err) => {
        // rollback if api fails
        admin.isActive = oldValue;
        this.applyFilters();
        this.errorMessage = this.getApiError(err, 'Failed to update status.');
      },
    });
  }

  filterAdmins(): void {
    this.applyFilters();
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive'): void {
    if (this.statusFilter === filter) return;
    this.statusFilter = filter;
    this.applyFilters();
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    let data = [...this.admins];

    if (this.statusFilter === 'active') {
      data = data.filter((admin) => admin.isActive);
    } else if (this.statusFilter === 'inactive') {
      data = data.filter((admin) => !admin.isActive);
    }

    if (normalizedSearch) {
      data = data.filter(
        (admin) =>
          admin.name?.toLowerCase().includes(normalizedSearch) ||
          admin.serviceNumber?.includes(normalizedSearch)
      );
    }

    this.filteredAdmins = data;
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #0057a6, #0077cc)',
      'linear-gradient(135deg, #00a86b, #00cc88)',
      'linear-gradient(135deg, #8e44ad, #9b59b6)',
      'linear-gradient(135deg, #ff6b35, #ff9e5c)',
      'linear-gradient(135deg, #3498db, #2ecc71)',
    ];
    const safe = name || 'A';
    const index = safe.charCodeAt(0) % colors.length;
    return colors[index];
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  trackByAdmin(_: number, admin: AdminUser): string {
    return admin.id;
  }

  private getApiError(err: any, fallback: string): string {
    // Backend may return plain text (BadRequest/Conflict) or JSON
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim()) return err.error;
      if (err.error?.message) return err.error.message;
      if (err.status === 0) return 'Backend not reachable. Is API running on http://localhost:5043 ?';
      return `${fallback} (HTTP ${err.status})`;
    }
    return fallback;
  }
}
