import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  name: string;
  pages: string[];
  role: string;
}

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  pageTitle = 'Admin — User Registration';
  @ViewChild('formCard') formCard?: ElementRef<HTMLElement>;
  @ViewChild('nameField') nameField?: ElementRef<HTMLInputElement>;
  
  formData = {
    username: '',
    name: '',
    pages: [] as string[],
    role: 'user'
  };
  
  users: User[] = [];
  error = '';
  success = '';
  editingUser: User | null = null;
  
  // Dummy user data for testing
  dummyUsers: User[] = [
    {
      id: 1,
      name: 'John Smith',
      username: 'SN001',
      pages: ['SERVICE FULFILMENT', 'IP NW OP', 'BB ANW'],
      role: 'user'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      username: 'SN002',
      pages: ['OTN OP', 'TM Activity Plan'],
      role: 'padmin'
    },
    {
      id: 3,
      name: 'Michael Brown',
      username: 'SN003',
      pages: ['ROUTINE MTNC', 'TOWER MTCE ACIEVEMENT'],
      role: 'user'
    },
    {
      id: 4,
      name: 'Emily Davis',
      username: 'SN004',
      pages: ['SERVICE FULFILMENT', 'BB ANW', 'TM Activity Plan'],
      role: 'user'
    },
    {
      id: 5,
      name: 'Robert Wilson',
      username: 'SN005',
      pages: ['IP NW OP', 'OTN OP', 'ROUTINE MTNC'],
      role: 'padmin'
    }
  ];
  
  availablePages = [
    'SERVICE FULFILMENT',
    'IP NW OP',
    'BB ANW',
    'OTN OP',
    'TM Activity Plan',
    'ROUTINE MTNC',
    'TOWER MTCE ACIEVEMENT'
  ];

  constructor() {}

  ngOnInit() {
    // Load dummy data on init
    this.users = [...this.dummyUsers];
  }

  fetchUsers() {
    // Simulate API call with setTimeout
    setTimeout(() => {
      this.users = [...this.dummyUsers];
    }, 300);
  }

  handleChange(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    (this.formData as any)[field] = input.value;
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

    // Simulate API delay
    setTimeout(() => {
      if (this.editingUser) {
        // Update existing user
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index > -1) {
          this.users[index] = {
            ...this.editingUser,
            ...this.formData,
            id: this.editingUser.id
          };
          this.success = 'User updated successfully';
        }
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now(), // Generate unique ID
          ...this.formData
        };
        this.users.push(newUser);
        this.success = 'User created successfully';
      }
      
      this.resetForm();
      // No need to call fetchUsers() since we're working with local data
    }, 500);
  }

  handleEdit(user: User) {
    this.editingUser = user;
    this.formData = {
      username: user.username,
      name: user.name,
      pages: [...user.pages],
      role: user.role
    };

    setTimeout(() => {
      this.formCard?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.nameField?.nativeElement.focus();
    }, 50);
  }

  handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    // Simulate API delay
    setTimeout(() => {
      const index = this.users.findIndex(u => u.id === id);
      if (index > -1) {
        this.users.splice(index, 1);
        this.success = 'User deleted successfully';
        
        // If we were editing this user, reset the form
        if (this.editingUser && this.editingUser.id === id) {
          this.cancelEdit();
        }
      }
    }, 500);
  }

  cancelEdit() {
    this.editingUser = null;
    this.resetForm();
  }

  private resetForm() {
    this.formData = {
      username: '',
      name: '',
      pages: [],
      role: 'user'
    };
    this.editingUser = null;
  }

  fillBasicTestData() {
    this.formData.name = 'Test User';
    this.formData.username = `SN${100 + this.users.length}`;
    this.formData.pages = this.availablePages.length ? [this.availablePages[0]] : [];
  }

  selectAllPages() {
    this.formData.pages = [...this.availablePages];
  }

  clearPages() {
    this.formData.pages = [];
  }

  // Helper method to add more dummy data
  addDummyUser() {
    const dummyNames = [
      'James Miller', 'Patricia Taylor', 'David Anderson', 'Linda Thomas',
      'William Jackson', 'Barbara White', 'Richard Harris', 'Susan Martin'
    ];
    
    const dummyServiceNumbers = ['SN006', 'SN007', 'SN008', 'SN009', 'SN010'];
    
    const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const randomServiceNumber = dummyServiceNumbers[Math.floor(Math.random() * dummyServiceNumbers.length)];
    const randomPages = this.getRandomPages();
    const randomRole = Math.random() > 0.5 ? 'user' : 'padmin';
    
    const newUser: User = {
      id: Date.now(),
      name: randomName,
      username: randomServiceNumber,
      pages: randomPages,
      role: randomRole
    };
    
    this.users.push(newUser);
    this.success = `Dummy user "${randomName}" added successfully`;
  }

  private getRandomPages(): string[] {
    const count = Math.floor(Math.random() * 4) + 1; // 1-4 pages
    const shuffled = [...this.availablePages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Method to reset to initial dummy data
  resetToDummyData() {
    this.users = [...this.dummyUsers];
    this.success = 'Reset to initial dummy data';
  }
}