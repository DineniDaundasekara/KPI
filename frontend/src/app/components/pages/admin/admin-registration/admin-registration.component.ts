import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

interface AdminUser {
  id: string;
  name: string;
  serviceNumber: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

@Component({
  selector: 'app-admin-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-registration.component.html',
  styleUrls: ['./admin-registration.component.scss']
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
  
  // Sample data from your document
  private sampleAdmins: AdminUser[] = [
    {
      id: '1',
      name: 'Hasangi',
      serviceNumber: '010399',
      isActive: true,
      createdAt: '2024-01-15T08:30:00Z',
      lastLogin: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Yamuna',
      serviceNumber: '012264',
      isActive: true,
      createdAt: '2024-01-20T10:15:00Z',
      lastLogin: '2024-03-10T14:30:00Z'
    },
    {
      id: '3',
      name: 'test',
      serviceNumber: 'status',
      isActive: true,
      createdAt: '2024-02-01T14:45:00Z',
      lastLogin: '2024-02-01T14:45:00Z'
    },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAdmins();
  }

  private buildForm(): void {
    this.adminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      serviceNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/),
        ],
      ],
    });
  }

  loadAdmins(): void {
    // Load sample data
    this.admins = [...this.sampleAdmins];
    this.applyFilters();
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
    return this.admins.filter(a => a.isActive).length;
  }

  getInactiveCount(): number {
    return this.admins.filter(a => !a.isActive).length;
  }

  onSubmit(): void {
    if (this.adminForm.invalid || this.isSubmitting) return;
    
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const formData = {
      name: this.adminForm.get('name')?.value.trim(),
      serviceNumber: this.adminForm.get('serviceNumber')?.value.trim()
    };

    // Simulate API call with delay
    setTimeout(() => {
      // Check for duplicate service number
      const alreadyExists = this.admins.some(
        admin => admin.serviceNumber === formData.serviceNumber
      );
      
      if (alreadyExists) {
        this.errorMessage = `Service Number ${formData.serviceNumber} already exists.`;
        this.isSubmitting = false;
        return;
      }

      // Create new admin
      const newAdmin: AdminUser = {
        id: (Date.now()).toString(),
        name: formData.name,
        serviceNumber: formData.serviceNumber,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Add to the list
      this.admins = [newAdmin, ...this.admins];
      this.applyFilters();
      
      this.successMessage = `Admin "${newAdmin.name}" created successfully.`;
      this.adminForm.reset();
      this.isSubmitting = false;
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 500);
  }

  filterAdmins(): void {
    this.applyFilters();
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive'): void {
    if (this.statusFilter === filter) {
      return;
    }
    this.statusFilter = filter;
    this.applyFilters();
  }

  deleteAdmin(id: string): void {
    const admin = this.admins.find((a) => a.id === id);
    if (!admin) return;

    if (!window.confirm(
      `Delete admin "${admin.name}" (${admin.serviceNumber})?`
    )) return;

    this.admins = this.admins.filter((a) => a.id !== id);
    this.applyFilters();
    
    this.successMessage = `Admin "${admin.name}" deleted successfully.`;
    
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  toggleStatus(admin: AdminUser): void {
    admin.isActive = !admin.isActive;
    this.successMessage = `Admin "${admin.name}" ${admin.isActive ? 'activated' : 'deactivated'}.`;
    this.applyFilters();
    
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    let data = [...this.admins];

    if (this.statusFilter === 'active') {
      data = data.filter(admin => admin.isActive);
    } else if (this.statusFilter === 'inactive') {
      data = data.filter(admin => !admin.isActive);
    }

    if (normalizedSearch) {
      data = data.filter(admin =>
        admin.name.toLowerCase().includes(normalizedSearch) ||
        admin.serviceNumber.includes(normalizedSearch)
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
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }

  trackByAdmin(_: number, admin: AdminUser): string {
    return admin.id;
  }
}