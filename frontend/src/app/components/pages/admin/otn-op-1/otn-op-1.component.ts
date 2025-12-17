import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type KpiRecord = {
  _id: string;
  no: number | string;
  network_engineer_kpi: string;
  division: string;
  section: string;
  kpi_percent: string;
};

const MOCK_KPI_RECORDS: KpiRecord[] = [
  {
    _id: '675bce5e86740514a3edc5e1',
    no: 8,
    network_engineer_kpi: 'SLBN NW Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: '99.999'
  },
  {
    _id: '675bd3bb86740514a3edc5f6',
    no: 9,
    network_engineer_kpi: 'SDH NW availability',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: '99.996'
  },
  {
    _id: '675bd83f86740514a3edc5ff',
    no: 10,
    network_engineer_kpi: 'Fiber NW availability',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: '99.99'
  },
  {
    _id: '6763cc8e3e62f54c4c94e666',
    no: 5,
    network_engineer_kpi: 'International BH Availability',
    division: 'TRANSPORT & ACCESS',
    section: 'BB&ANW',
    kpi_percent: '99.999'
  }
];

@Component({
  selector: 'app-otn-op-1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './otn-op-1.component.html',
  styleUrls: ['./otn-op-1.component.scss']
})
export class OtnOp1Component implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'INT & NT OP_1';
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
      .get<KpiRecord[]>('/form8/')
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
      ? this.http.put(`/form8/update/${this.editingId}`, payload)
      : this.http.post('/form8/add', payload);

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
      kpi_percent: record.kpi_percent
    });
  }

  onDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.saving = true;
    this.http
      .delete(`/form8/delete/${id}`)
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

