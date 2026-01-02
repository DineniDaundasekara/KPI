import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type DetailedMetric = Record<string, string | { $oid: string }>;

type KpiRecord = {
  _id: string;
  no: number | string;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: string | number;
  Total_Failed_Links?: DetailedMetric;
  Links_SLA_Not_Violated?: DetailedMetric;
};

const MOCK_KPI_RECORDS: KpiRecord[] = [
  {
    _id: '675bf36486740514a3edc615',
    no: 12,
    network_engineer_kpi: 'Fiber Failures Restoration(General): <4 Hrs',
    division: 'TRANSPORT & ACCESS',
    section: 'INT  & NT OP',
    kpi_percent: 0.85
  },
  {
    _id: '675bf61e86740514a3edc621',
    no: 13,
    network_engineer_kpi: 'Fiber Failures Restoration(Large scale< Pole damages etc>): <8 Hrs',
    division: 'TRANSPORT & ACCESS',
    section: 'INT  & NT OP',
    kpi_percent: 0.8
  }
];

@Component({
  selector: 'app-otn-op-2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './otn-op-2.component.html',
  styleUrls: ['./otn-op-2.component.scss']
})
export class OtnOp2Component implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'INT & NT OP_02';
  records: KpiRecord[] = [...MOCK_KPI_RECORDS];
  editingId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    no: ['', Validators.required],
    network_engineer_kpi: ['', Validators.required],
    division: ['', Validators.required],
    section: ['', Validators.required],
    kpi_percent: ['', Validators.required]
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http
      .get<KpiRecord[]>('/form9/')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.records = response?.length ? response : [...MOCK_KPI_RECORDS];
        },
        error: err => {
          console.error('Failed to fetch data', err);
          this.errorMessage = 'Unable to load KPI records right now. Showing sample data.';
          this.records = [...MOCK_KPI_RECORDS];
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const request$ = this.editingId
      ? this.http.put(`/form9/update/${this.editingId}`, payload)
      : this.http.post('/form9/add', payload);

    this.saving = true;
    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.fetchData();
        },
        error: err => {
          console.error('Failed to save data', err);
          this.errorMessage = 'Saving failed. Please try again.';
        }
      });
  }

  onEdit(record: KpiRecord): void {
    this.editingId = record._id;
    this.form.patchValue({
      no: record.no?.toString() ?? '',
      network_engineer_kpi: record.network_engineer_kpi,
      division: record.division,
      section: record.section,
      kpi_percent: record.kpi_percent?.toString() ?? ''
    });
  }

  onDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.saving = true;
    this.http
      .delete(`/form9/delete/${id}`)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.fetchData(),
        error: err => {
          console.error('Failed to delete data', err);
          this.errorMessage = 'Deletion failed. Please try again.';
        }
      });
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      no: '',
      network_engineer_kpi: '',
      division: '',
      section: '',
      kpi_percent: ''
    });
    this.editingId = null;
  }
}

