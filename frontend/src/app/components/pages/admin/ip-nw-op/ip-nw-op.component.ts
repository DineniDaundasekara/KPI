import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Form6Row {
  _id: string;
  no: number;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: string | number;
}

const MOCK_FORM6_ROWS: Form6Row[] = [
  {
    _id: 'mock-1',
    no: 8,
    network_engineer_kpi: 'IP Core NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'IP NW OP',
    kpi_percent: 99.999,
  },
  {
    _id: 'mock-2',
    no: 9,
    network_engineer_kpi: 'BSR NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'IP NW OP',
    kpi_percent: 99.99,
  },
  {
    _id: 'mock-3',
    no: 10,
    network_engineer_kpi: 'Service Edge NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'IP NW OP',
    kpi_percent: 99.95,
  },
];

@Component({
  selector: 'app-admin-ip-nw-op',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ip-nw-op.component.html',
  styleUrls: ['./ip-nw-op.component.scss'],
})
export class AdminIpNwOpComponent implements OnInit {
  pageTitle = 'Admin — IP NW OP';

  data: Form6Row[] = [];

  form = {
    no: '',
    network_engineer_kpi: '',
    division: '',
    section: '',
    kpi_percent: '',
  };

  editingId: string | null = null;

  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Form6Row[]>('/form6/').subscribe({
      next: (res) => {
        const rows = Array.isArray(res) && res.length ? res : MOCK_FORM6_ROWS;
        if (!res || !res.length) {
          console.warn('Form6 API returned empty payload. Falling back to mock data.');
        }
        this.data = [...rows];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.data = [...MOCK_FORM6_ROWS];
        this.error = null;
        this.loading = false;
      },
    });
  }

  // Keep the old React mapping support (kpi/target/calculation/platform)
  handleInputChange(name: string, value: string): void {
    const fieldMapping: Record<string, keyof typeof this.form> = {
      kpi: 'network_engineer_kpi',
      target: 'division',
      calculation: 'section',
      platform: 'kpi_percent',
    };

    const fieldName = fieldMapping[name] || (name as keyof typeof this.form);
    this.form = { ...this.form, [fieldName]: value };
  }

  async save(): Promise<void> {
    this.error = null;

    const payload = {
      no: this.form.no,
      network_engineer_kpi: this.form.network_engineer_kpi,
      division: this.form.division,
      section: this.form.section,
      kpi_percent: this.form.kpi_percent,
    };

    try {
      if (this.editingId) {
        await this.http.put(`/form6/update/${this.editingId}`, payload).toPromise();
      } else {
        await this.http.post('/form6/add', payload).toPromise();
      }

      this.resetForm();
      this.loadData();
    } catch (err) {
      console.error(err);
      this.error = 'Failed to save data. Please try again.';
    }
  }

  editRow(item: Form6Row): void {
    this.form = {
      no: String(item.no ?? ''),
      network_engineer_kpi: item.network_engineer_kpi ?? '',
      division: item.division ?? '',
      section: item.section ?? '',
      kpi_percent: String(item.kpi_percent ?? ''),
    };
    this.editingId = item._id;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async deleteRow(id: string): Promise<void> {
    const ok = window.confirm('Are you sure you want to delete this item?');
    if (!ok) return;

    try {
      await this.http.delete(`/form6/delete/${id}`).toPromise();
      this.loadData();
    } catch (err) {
      console.error(err);
      this.error = 'Failed to delete item. Please try again.';
    }
  }

  resetForm(): void {
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
