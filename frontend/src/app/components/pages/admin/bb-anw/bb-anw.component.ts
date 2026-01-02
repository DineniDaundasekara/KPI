import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface Form7Row {
  _id: string;
  no: number;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: string | number;
}

const MOCK_FORM7_ROWS: Form7Row[] = [
  {
    _id: 'mock-1',
    no: 8,
    network_engineer_kpi: 'Tellabs NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: 99.99,
  },
  {
    _id: 'mock-2',
    no: 9,
    network_engineer_kpi: 'MEN NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: 99.98,
  },
  {
    _id: 'mock-3',
    no: 10,
    network_engineer_kpi: 'MSAN Availability (Except Power)',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: 99.95,
  },
];

@Component({
  selector: 'app-admin-bb-anw',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './bb-anw.component.html',
  styleUrls: ['./bb-anw.component.scss'],
})
export class AdminBbAnwComponent implements OnInit {
  pageTitle = 'Admin — BB ANW';

  data: Form7Row[] = [];
  form = {
    no: '',
    network_engineer_kpi: '',
    division: '',
    section: '',
    kpi_percent: '',
  };

  editingId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  notice: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.notice = null;

    this.http.get<Form7Row[]>('/form7/').subscribe({
      next: (res) => {
        const rows = Array.isArray(res) && res.length ? res : [...MOCK_FORM7_ROWS];
        this.data = rows.map((row, idx) => ({
          ...row,
          no: typeof row.no === 'number' ? row.no : Number(row.no) || idx + 1,
        }));
        this.loading = false;
        if (!res || !res.length) {
          this.notice = 'Using mock data until the backend returns Form7 records.';
        }
      },
      error: (err) => {
        console.error('Failed to load Form7 data:', err);
        this.data = [...MOCK_FORM7_ROWS];
        this.loading = false;
        this.error = 'Backend unreachable. Showing mock data.';
      },
    });
  }

  async submitForm(): Promise<void> {
    if (this.saving) {
      return;
    }

    const payload = {
      no: Number(this.form.no) || 0,
      network_engineer_kpi: this.form.network_engineer_kpi.trim(),
      division: this.form.division.trim(),
      section: this.form.section.trim(),
      kpi_percent: this.form.kpi_percent,
    };

    if (!payload.no || !payload.network_engineer_kpi || !payload.division || !payload.section) {
      this.error = 'Please complete all required fields.';
      return;
    }

    this.saving = true;
    this.error = null;

    try {
      if (this.editingId) {
        await firstValueFrom(this.http.put(`/form7/update/${this.editingId}`, payload));
      } else {
        await firstValueFrom(this.http.post('/form7/add', payload));
      }

      this.resetForm();
      this.loadData();
    } catch (err) {
      console.error('Failed to save BB ANW data:', err);
      this.error = 'Failed to save data. Please try again.';
    } finally {
      this.saving = false;
    }
  }

  editRow(row: Form7Row): void {
    this.form = {
      no: String(row.no ?? ''),
      network_engineer_kpi: row.network_engineer_kpi ?? '',
      division: row.division ?? '',
      section: row.section ?? '',
      kpi_percent: String(row.kpi_percent ?? ''),
    };
    this.editingId = row._id;
    this.error = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async deleteRow(id: string): Promise<void> {
    const confirmDelete = window.confirm('Are you sure you want to delete this KPI?');
    if (!confirmDelete) {
      return;
    }

    this.saving = true;
    this.error = null;

    try {
      await firstValueFrom(this.http.delete(`/form7/delete/${id}`));
      if (this.editingId === id) {
        this.resetForm();
      }
      this.loadData();
    } catch (err) {
      console.error('Failed to delete Form7 entry:', err);
      this.error = 'Failed to delete the selected KPI.';
    } finally {
      this.saving = false;
    }
  }

  trackRow(index: number, row: Form7Row): string {
    return row._id || `${row.network_engineer_kpi}-${index}`;
  }

  private resetForm(): void {
    this.form = {
      no: '',
      network_engineer_kpi: '',
      division: '',
      section: '',
      kpi_percent: '',
    };
    this.editingId = null;
  }
}

