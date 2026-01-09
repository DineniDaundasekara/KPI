import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Form7Row {
  id: string;
  no: number;
  networkEngineerKpi: string;
  division: string;
  section: string;
  kpiPercent: number;
}

@Component({
  selector: 'app-admin-bb-anw',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './bb-anw.component.html',
  styleUrls: ['./bb-anw.component.scss'],
})
export class AdminBbAnwComponent implements OnInit {
  pageTitle = 'Admin — BB ANW';

  private apiUrl = 'http://localhost:5043/api/form7';

  data: Form7Row[] = [];

  form = {
    no: '',
    networkEngineerKpi: '',
    division: '',
    section: '',
    kpiPercent: '',
  };

  editingId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.http.get<Form7Row[]>(this.apiUrl).subscribe({
      next: res => {
        this.data = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to load data';
        this.loading = false;
      }
    });
  }

  submitForm(): void {
    if (this.saving) return;

    const payload = {
      no: Number(this.form.no),
      networkEngineerKpi: this.form.networkEngineerKpi.trim(),
      division: this.form.division.trim(),
      section: this.form.section.trim(),
      kpiPercent: Number(this.form.kpiPercent)
    };

    if (!payload.no || !payload.networkEngineerKpi || !payload.division || !payload.section) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.saving = true;
    this.error = null;

    const request$ = this.editingId
      ? this.http.put(`${this.apiUrl}/${this.editingId}`, payload)
      : this.http.post(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadData();
        this.saving = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Save failed';
        this.saving = false;
      }
    });
  }

  editRow(row: Form7Row): void {
    this.form = {
      no: row.no.toString(),
      networkEngineerKpi: row.networkEngineerKpi,
      division: row.division,
      section: row.section,
      kpiPercent: row.kpiPercent.toString()
    };
    this.editingId = row.id;
  }

  deleteRow(id: string): void {
    if (!confirm('Delete this KPI?')) return;

    this.saving = true;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.loadData();
        this.saving = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Delete failed';
        this.saving = false;
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  trackRow(_: number, row: Form7Row): string {
    return row.id;
  }

  private resetForm(): void {
    this.form = {
      no: '',
      networkEngineerKpi: '',
      division: '',
      section: '',
      kpiPercent: '',
    };
    this.editingId = null;
  }
}
