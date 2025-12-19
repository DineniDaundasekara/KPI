import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RegionService, RegionDto } from '../../../../services/region.service';  // Import the service
import { HttpErrorResponse } from '@angular/common/http';  // Import HttpErrorResponse

// Define the Region interface for type safety
export interface Region {
  id: string | number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
}

// Define the key names of the Region
type RegionKey = 'region' | 'province' | 'networkEngineer' | 'lea';

@Component({
  selector: 'app-region-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './region-management.component.html',
  styleUrls: ['./region-management.component.scss'],
})
export class RegionManagementComponent {
  pageTitle = 'Region Management';
  showForm = false;
  isSubmitting = false;
  error = '';
  success = '';

  formData: RegionDto = {
    id: '',
    region: '',
    province: '',
    networkEngineer: '',
    lea: '',
    createdAt: '',
    updatedAt: '',
  };

  regions: RegionDto[] = [];  // Initialize an empty regions array

  // Sorting state
  sortKey: RegionKey | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Inline edit state
  editingRowId: Region['id'] | null = null;
  editingField: RegionKey | null = null;
  editingValue = '';

  constructor(private regionService: RegionService) {}

  // Fetch all regions from the backend
  ngOnInit(): void {
    this.loadRegions();
  }

  loadRegions(): void {
    this.regionService.getAllRegions().subscribe(
      (data) => {
        this.regions = data;
      },
      (error: HttpErrorResponse) => {
        console.error('Error loading regions:', error);
        this.error = 'Failed to load regions.';
      }
    );
  }

  // Open the form
  openForm(): void {
    this.showForm = true;
    this.error = '';
    this.success = '';
  }

  // Close the form and reset it
  closeForm(form?: NgForm): void {
    this.showForm = false;
    this.error = '';
    this.success = '';
    this.resetForm(form);
  }

  private resetForm(form?: NgForm): void {
    this.formData = {
      id: '',
      region: '',
      province: '',
      networkEngineer: '',
      lea: '',
      createdAt: '',
      updatedAt: '',
    };

    if (form) {
      form.resetForm();
    }
  }

  // Submit form data to the backend API
  onSubmit(form: NgForm): void {
    this.error = '';
    this.success = '';

    if (!form.valid) {
      this.error = 'Please fill all required fields.';
      form.control.markAllAsTouched();
      return;
    }

    const trimmed = {
      region: this.formData.region.trim(),
      province: this.formData.province.trim(),
      networkEngineer: this.formData.networkEngineer.trim(),
      lea: this.formData.lea.trim(),
    };

    if (
      !trimmed.region ||
      !trimmed.province ||
      !trimmed.networkEngineer ||
      !trimmed.lea
    ) {
      this.error = 'All fields are required.';
      return;
    }

    this.isSubmitting = true;

    // Create region and send to the backend API
    this.regionService.createRegion(trimmed as RegionDto).subscribe(
      (newRegion) => {
        this.regions = [newRegion, ...this.regions];
        this.isSubmitting = false;
        this.success = 'Region added successfully.';
        this.resetForm(form);
        this.showForm = false;
      },
      (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        console.error('Error adding region:', error);
        this.error = 'Failed to add region.';
      }
    );
  }

  // Delete region from the list
  handleDelete(id: string): void {
    const confirmDelete = confirm('Are you sure you want to delete this region?');
    if (!confirmDelete) return;

    const idString = id.toString();

    this.regionService.deleteRegion(id).subscribe(
      () => {
        this.regions = this.regions.filter((region) => region.id !== idString);  // Remove region from the list after deletion
        this.success = 'Region deleted successfully.';
      },
      (error: HttpErrorResponse) => {
        console.error('Error deleting region:', error);
        this.error = 'Failed to delete region.';
      }
    );
  }

  // Sorting logic: request sorting for a specific column
  requestSort(key: RegionKey): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  // Get sort indicator (▲ for ascending, ▼ for descending)
  getSortIndicator(key: RegionKey): string {
    if (this.sortKey !== key) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  // Sorted regions based on sorting criteria
  get sortedRegions(): Region[] {
    const data = [...this.regions];
    if (!this.sortKey) return data;

    const key = this.sortKey;
    const direction = this.sortDirection;

    return data.sort((a, b) => {
      const aVal = (a[key] ?? '').toString().toLowerCase();
      const bVal = (b[key] ?? '').toString().toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Inline editing logic
  isEditingCell(row: Region, field: RegionKey): boolean {
    return this.editingRowId === row.id && this.editingField === field;
  }

  startCellEdit(row: Region, field: RegionKey): void {
    this.editingRowId = row.id;
    this.editingField = field;
    this.editingValue = (row[field] ?? '').toString();
  }

  onCellKeydown(event: KeyboardEvent, row: Region, field: RegionKey): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveCell(row, field);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelCellEdit();
    }
  }

  saveCell(row: Region, field: RegionKey): void {
    const value = this.editingValue.trim();
    if (!value) return;

    const index = this.regions.findIndex((r) => r.id === row.id);
    if (index !== -1) {
      this.regions[index] = {
        ...this.regions[index],
        [field]: value,
      };
    }

    this.cancelCellEdit();
  }

  cancelCellEdit(): void {
    this.editingRowId = null;
    this.editingField = null;
    this.editingValue = '';
  }
}
