import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Form6Row {
  id: string;
  no: number;
  networkEngineerKpi: string;
  division: string;
  section: string;
  kpiPercent: number;
}

@Component({
  selector: 'app-admin-ip-nw-op',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ip-nw-op.component.html',
  styleUrls: ['./ip-nw-op.component.scss'],
})
export class AdminIpNwOpComponent implements OnInit {
  pageTitle = 'Admin — IP NW OP';

  // ✅ change port if your backend uses different one
  private readonly baseUrl = '/api/IpNwOp';

  data: Form6Row[] = [];

  form = {
    no: '',
    networkEngineerKpi: '',
    division: '',
    section: '',
    kpiPercent: '',
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

    this.http.get<Form6Row[]>(this.baseUrl).subscribe({
      next: (res) => {
        this.data = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Load error:', err);
        this.data = [];
        this.error = 'Failed to load data from backend.';
        this.loading = false;
      },
    });
  }

  // ✅ required because your HTML uses handleInputChange(...)
  handleInputChange(name: string, value: string): void {
    const fieldMapping: Record<string, keyof typeof this.form> = {
      kpi: 'networkEngineerKpi',
      target: 'division',
      calculation: 'section',
      platform: 'kpiPercent',
    };

    const fieldName = fieldMapping[name] || (name as keyof typeof this.form);
    this.form = { ...this.form, [fieldName]: value };
  }

  async save(): Promise<void> {
    this.error = null;

    const payload = {
      id: this.editingId ?? undefined,
      no: this.form.no ? Number(this.form.no) : 0,
      networkEngineerKpi: this.form.networkEngineerKpi,
      division: this.form.division,
      section: this.form.section,
      kpiPercent: this.form.kpiPercent ? Number(this.form.kpiPercent) : 0,
    };

    try {
      if (this.editingId) {
        await this.http.put(`${this.baseUrl}/${this.editingId}`, payload).toPromise();
      } else {
        await this.http.post(this.baseUrl, payload).toPromise();
      }

      this.resetForm();
      this.loadData();
    } catch (err) {
      console.error('Save error:', err);
      this.error = 'Failed to save data. Please try again.';
    }
  }

  editRow(item: Form6Row): void {
    this.form = {
      no: String(item.no ?? ''),
      networkEngineerKpi: item.networkEngineerKpi ?? '',
      division: item.division ?? '',
      section: item.section ?? '',
      kpiPercent: String(item.kpiPercent ?? ''),
    };
    this.editingId = item.id;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async deleteRow(id: string): Promise<void> {
    const ok = window.confirm('Are you sure you want to delete this item?');
    if (!ok) return;

    try {
      await this.http.delete(`${this.baseUrl}/${id}`).toPromise();
      this.loadData();
    } catch (err) {
      console.error('Delete error:', err);
      this.error = 'Failed to delete item. Please try again.';
    }
  }

  resetForm(): void {
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
