import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type RoutineRecord = {
  _id: string;
  no: number | string;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibleDGM: string;
  definedOLADetails: string;
  dataSources: string;
};

const MOCK_ROUTINE_RECORDS: RoutineRecord[] = [
  {
    _id: '67520abfbf62c9a168f26033',
    no: 1,
    kpi: 'Routing maintenance - IPNW (every two months)',
    target: '100.000%',
    calculation: '# completed nodes / Total # Nodes',
    platform: 'IPNW',
    responsibleDGM: 'NW Mng',
    definedOLADetails: 'Every 2 Months',
    dataSources: 'NW Report'
  },
  {
    _id: '67520abfbf62c9a168f26034',
    no: 2,
    kpi: 'Routing maintenance - SDH/SLBN (every two months)',
    target: '100.000%',
    calculation: '# completed nodes / Total # Nodes',
    platform: 'Int & NT',
    responsibleDGM: 'NW Mng',
    definedOLADetails: 'Every 2 Months',
    dataSources: 'NW Report'
  },
  {
    _id: '67520abfbf62c9a168f26035',
    no: 3,
    kpi: 'Routing maintenance - MSAN/OLTE (every six months)',
    target: '100.000%',
    calculation: '# completed nodes / Total # Nodes',
    platform: 'BB&ANW',
    responsibleDGM: 'NW Mng',
    definedOLADetails: 'Every 4 Months',
    dataSources: 'NW Report'
  }
];

@Component({
  selector: 'app-admin-routine-mtnc',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './routine-mtnc.component.html',
  styleUrls: ['./routine-mtnc.component.scss']
})
export class AdminRoutineMtncComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'Routine MTNC';
  records: RoutineRecord[] = [...MOCK_ROUTINE_RECORDS];
  editingId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    no: ['', Validators.required],
    kpi: ['', Validators.required],
    target: ['', Validators.required],
    calculation: ['', Validators.required],
    platform: ['', Validators.required],
    responsibleDGM: ['', Validators.required],
    definedOLADetails: ['', Validators.required],
    dataSources: ['', Validators.required]
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http
      .get<RoutineRecord[]>('/api/mtnc-routine')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.records = response?.length ? response : [...MOCK_ROUTINE_RECORDS];
        },
        error: err => {
          console.error('Failed to fetch data', err);
          this.errorMessage = 'Unable to load routine maintenance KPIs. Showing sample data.';
          this.records = [...MOCK_ROUTINE_RECORDS];
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
      ? this.http.put(`/api/mtnc-routine/update/${this.editingId}`, payload)
      : this.http.post('/api/mtnc-routine/add', payload);

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

  onEdit(record: RoutineRecord): void {
    this.editingId = record._id;
    this.form.patchValue({
      no: record.no?.toString() ?? '',
      kpi: record.kpi,
      target: record.target,
      calculation: record.calculation,
      platform: record.platform,
      responsibleDGM: record.responsibleDGM,
      definedOLADetails: record.definedOLADetails,
      dataSources: record.dataSources
    });
  }

  onDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.saving = true;
    this.http
      .delete(`/api/mtnc-routine/delete/${id}`)
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
      kpi: '',
      target: '',
      calculation: '',
      platform: '',
      responsibleDGM: '',
      definedOLADetails: '',
      dataSources: ''
    });
    this.editingId = null;
  }
}

