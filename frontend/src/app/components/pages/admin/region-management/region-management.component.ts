import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface Region {
  id: string | number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
}

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

  /* ---------- Form / header state ---------- */

  showForm = false;
  isSubmitting = false;
  error = '';
  success = '';

  formData: Region = {
    id: '',
    region: '',
    province: '',
    networkEngineer: '',
    lea: '',
  };

  /* ---------- Dummy region data (replace with API later) ---------- */

  regions: Region[] = [
    {
      id: 1,
      region: 'Region 500',
      province: 'WP NEW 5',
      networkEngineer: 'test 500',
      lea: 'new lea 5',
    },
    {
      id: 2,
      region: 'region 4',
      province: 'WP NEW',
      networkEngineer: 'test me',
      lea: 'new lea r4',
    },
    {
      id: 3,
      region: 'Region 3',
      province: 'NP',
      networkEngineer: 'NW/NP-2',
      lea: 'KO / MLT / MB / VA',
    },
    {
      id: 4,
      region: 'Region 3',
      province: 'NP',
      networkEngineer: 'NW/NP-1',
      lea: 'JA',
    },
  ];

  /* ---------- Sorting state ---------- */

  sortKey: RegionKey | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  /* ---------- Inline cell edit state ---------- */

  editingRowId: Region['id'] | null = null;
  editingField: RegionKey | null = null;
  editingValue = '';

  /* ================= HEADER / FORM HELPERS ================= */

  openForm(): void {
    this.showForm = true;
    this.error = '';
    this.success = '';
  }

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
    };

    if (form) {
      form.resetForm();
    }
  }

  /* ================= ADD REGION (SUBMIT) ================= */

  onSubmit(form: NgForm): void {
    this.error = '';
    this.success = '';

    if (!form.valid) {
      this.error = 'Please fill all required fields.';
      form.control.markAllAsTouched();
      return;
    }

    const trimmed: Record<RegionKey, string> = {
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

    // Simulate async – replace with API call later
    setTimeout(() => {
      const newRegion: Region = {
        id: Date.now(),
        region: trimmed.region,
        province: trimmed.province,
        networkEngineer: trimmed.networkEngineer,
        lea: trimmed.lea,
      };

      // Add to top of the list
      this.regions = [newRegion, ...this.regions];

      this.isSubmitting = false;
      this.success = 'Region added successfully.';
      this.resetForm(form);
      this.showForm = false;
    }, 400);
  }

  /* ================= SORTING ================= */

  requestSort(key: RegionKey): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  getSortIndicator(key: RegionKey): string {
    if (this.sortKey !== key) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

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

  /* ================= INLINE CELL EDITING ================= */

  isEditingCell(row: Region, field: RegionKey): boolean {
    return this.editingRowId === row.id && this.editingField === field;
  }

  startCellEdit(row: Region, field: RegionKey): void {
    this.editingRowId = row.id;
    this.editingField = field;
    this.editingValue = (row[field] ?? '').toString();
  }

  onCellKeydown(
    event: KeyboardEvent,
    row: Region,
    field: RegionKey
  ): void {
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
    if (!value) {
      // optional: show validation message
      return;
    }

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

  /* ================= DELETE ROW ================= */

  handleDelete(id: string | number): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this region entry?'
    );
    if (!confirmDelete) return;

    this.regions = this.regions.filter((r) => r.id !== id);

    if (this.editingRowId === id) {
      this.cancelCellEdit();
    }
  }
}
