import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type TowerRecord = {
  _id: string;
  no: number | string;
  responsibility: string;
  frequency: string;
  weightage: string;
  kpi: string;
};

const MOCK_TOWER_RECORDS: TowerRecord[] = [
  {
    _id: '675203a744998ab8c31e19c9',
    no: 3,
    responsibility: 'Measure earth readings and inspect Earthing system.',
    frequency: 'Quarterly',
    weightage: '30%',
    kpi: '100%'
  },
  {
    _id: '675203a744998ab8c31e19c8',
    no: 2,
    responsibility: 'Visual inspection of tower condition, aviation lighting system etc.',
    frequency: 'Quarterly',
    weightage: '10%',
    kpi: '100%'
  },
  {
    _id: '675203a744998ab8c31e19c7',
    no: 1,
    responsibility: 'Proper maintaining and cleaning of tower site, access roads, tower leg bases and guy bases.',
    frequency: 'Quarterly',
    weightage: '60%',
    kpi: '100%'
  }
];

@Component({
  selector: 'app-admin-tower-mtce-achievement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './tower-mtce-achievement.component.html',
  styleUrls: ['./tower-mtce-achievement.component.scss']
})
export class AdminTowerMtceAchievementComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'TOWER MTCE ACHIEVEMENT';
  records: TowerRecord[] = [...MOCK_TOWER_RECORDS];
  editingId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    no: ['', Validators.required],
    responsibility: ['', Validators.required],
    frequency: ['', Validators.required],
    weightage: ['', Validators.required],
    kpi: ['', Validators.required]
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http
      .get<TowerRecord[]>('/api/kpi-tower')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.records = response?.length ? response : [...MOCK_TOWER_RECORDS];
        },
        error: err => {
          console.error('Failed to fetch data', err);
          this.errorMessage = 'Unable to load tower KPI records right now. Showing sample data.';
          this.records = [...MOCK_TOWER_RECORDS];
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
      ? this.http.put(`/api/kpi-tower/update/${this.editingId}`, payload)
      : this.http.post('/api/kpi-tower/add', payload);

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

  onEdit(record: TowerRecord): void {
    this.editingId = record._id;
    this.form.patchValue({
      no: record.no?.toString() ?? '',
      responsibility: record.responsibility,
      frequency: record.frequency,
      weightage: record.weightage,
      kpi: record.kpi
    });
  }

  onDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.saving = true;
    this.http
      .delete(`/api/kpi-tower/delete/${id}`)
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
      responsibility: '',
      frequency: '',
      weightage: '',
      kpi: ''
    });
    this.editingId = null;
  }
}

