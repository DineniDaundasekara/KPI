// src/app/components/pages/admin/user-registration/user-registration.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService, User, CreateUserDto, UpdateUserDto } from '../../../../services/user.service';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  pageTitle = 'Admin — User Registration';
  @ViewChild('formCard') formCard?: ElementRef<HTMLElement>;
  @ViewChild('nameField') nameField?: ElementRef<HTMLInputElement>;
  
  formData: CreateUserDto = {
    username: 0,
    name: '',
    pages: [],
    role: 'user',
    isActive: 'true'
  };
  
  users: User[] = [];
  error = '';
  success = '';
  editingUser: User | null = null;
  isLoading = false;
  
  availablePages = [
    'SERVICE FULFILMENT',
    'IP NW OP',
    'BB ANW',
    'OTN OP',
    'TM Activity Plan',
    'ROUTINE MTNC',
    'TOWER MTCE ACHIEVEMENT'
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to fetch users. Please check if backend is running.';
        console.error('Error fetching users:', error);
        this.isLoading = false;
        this.useDummyData();
      }
    });
  }

  handleChange(event: Event, field: keyof CreateUserDto) {
    const input = event.target as HTMLInputElement;
    
    if (field === 'username') {
      this.formData[field] = parseInt(input.value) || 0;
    } else {
      (this.formData as any)[field] = input.value;
    }
  }

  handlePageChange(page: string) {
    const index = this.formData.pages.indexOf(page);
    if (index > -1) {
      this.formData.pages.splice(index, 1);
    } else {
      this.formData.pages.push(page);
    }
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.error = '';
    this.success = '';

    if (!this.formData.name.trim()) {
      this.error = 'Name is required';
      return;
    }

    if (!this.formData.username || this.formData.username <= 0) {
      this.error = 'Valid service number is required';
      return;
    }

    this.isLoading = true;

    if (this.editingUser) {
      const updateData: UpdateUserDto = {
        username: this.formData.username,
        name: this.formData.name,
        role: this.formData.role,
        isActive: this.formData.isActive,
        pages: this.formData.pages
      };

      this.userService.updateUser(this.editingUser.id, updateData).subscribe({
        next: () => {
          this.success = 'User updated successfully';
          this.fetchUsers();
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.error = 'Failed to update user: ' + error.message;
          console.error('Update error:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.userService.createUser(this.formData).subscribe({
        next: (newUser: User) => {
          this.success = 'User created successfully';
          this.users.push(newUser);
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.error = 'Failed to create user: ' + error.message;
          console.error('Create error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  handleEdit(user: User) {
    this.editingUser = user;
    this.formData = {
      username: user.username,
      name: user.name,
      pages: [...user.pages],
      role: user.role,
      isActive: user.isActive
    };

    setTimeout(() => {
      this.formCard?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.nameField?.nativeElement.focus();
    }, 50);
  }

  handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.isLoading = true;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.success = 'User deleted successfully';
        this.users = this.users.filter(u => u.id !== id);
        if (this.editingUser && this.editingUser.id === id) {
          this.cancelEdit();
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to delete user: ' + error.message;
        console.error('Delete error:', error);
        this.isLoading = false;
      }
    });
  }

  cancelEdit() {
    this.editingUser = null;
    this.resetForm();
  }

  private resetForm() {
    this.formData = {
      username: 0,
      name: '',
      pages: [],
      role: 'user',
      isActive: 'true'
    };
    this.editingUser = null;
  }

  fillBasicTestData() {
    this.formData.name = 'Test User';
    this.formData.username = 10000 + this.users.length;
    this.formData.pages = this.availablePages.length ? [this.availablePages[0]] : [];
  }

  selectAllPages() {
    this.formData.pages = [...this.availablePages];
  }

  clearPages() {
    this.formData.pages = [];
  }

  private useDummyData() {
    console.log('Using dummy data as fallback');
    this.users = [
      {
        id: '1',
        username: 18231,
        name: 'Pavithra',
        role: 'padmin',
        isActive: 'true',
        pages: ['SERVICE FULFILMENT', 'IP NW OP'],
        createdAt: '2025-08-13T09:42:30.083Z',
        updatedAt: '2025-08-13T09:42:30.083Z',
        v: true
      }
    ];
  }

  testBackendConnection() {
    this.error = '';
    this.success = 'Testing backend connection...';
    fetch('http://localhost:5043/api/users')
      .then(response => {
        if (response.ok) {
          this.success = 'Backend connection successful!';
        } else {
          this.error = `Backend returned status: ${response.status}`;
        }
      })
      .catch(err => {
        this.error = 'Cannot connect to backend. Make sure it\'s running on http://localhost:5043';
        console.error('Connection test failed:', err);
      });
  }
}