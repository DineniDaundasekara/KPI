import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Form6Row {
  _id: string;
  no: number;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: number; // keep as number for sorting + display
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

  // backend base url
  private apiBase = 'http://localhost:5043';

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

  // ✅ only initial load + manual retry uses this
  loadData(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Form6Row[]>(`${this.apiBase}/form6/`).subscribe({
      next: (res) => {
        this.data = Array.isArray(res) ? res : [];
        this.sortData();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.data = [];
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
      },
    });
  }

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
      no: Number(this.form.no),
      network_engineer_kpi: this.form.network_engineer_kpi.trim(),
      division: this.form.division.trim(),
      section: this.form.section.trim(),
      kpi_percent: Number(this.form.kpi_percent),
    };

    if (
      !payload.no ||
      !payload.network_engineer_kpi ||
      !payload.division ||
      !payload.section ||
      Number.isNaN(payload.kpi_percent)
    ) {
      this.error = 'Please fill all fields correctly.';
      return;
    }

    try {
      // ✅ do NOT set loading for full page here (avoid big loading screen)
      if (this.editingId) {
        // UPDATE
        await firstValueFrom(
          this.http.put(`${this.apiBase}/form6/update/${this.editingId}`, payload)
        );

        // 🔥 update local array instantly
        const idx = this.data.findIndex((x) => x._id === this.editingId);
        if (idx !== -1) {
          this.data[idx] = { _id: this.editingId, ...payload };
          this.sortData();
        }
      } else {
        // ADD
        const res: any = await firstValueFrom(
          this.http.post(`${this.apiBase}/form6/add`, payload)
        );

        // 🔥 insert locally instantly
        const newId = res?._id || res?.id || crypto.randomUUID();
        this.data.push({ _id: newId, ...payload });
        this.sortData();
      }

      this.resetForm();
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
      await firstValueFrom(this.http.delete(`${this.apiBase}/form6/delete/${id}`));

      // 🔥 remove locally instantly
      this.data = this.data.filter((x) => x._id !== id);
    } catch (err) {
      console.error(err);
      this.error = 'Failed to delete item. Please try again.';
    }
  }

  private sortData(): void {
    this.data = [...this.data].sort((a, b) => (a.no ?? 0) - (b.no ?? 0));
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
