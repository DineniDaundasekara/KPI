import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type ActivityRecord = {
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

const MOCK_ACTIVITY_RECORDS: ActivityRecord[] = [
  {
    _id: '67528f98b576da39f9897dbd',
    no: 4,
    kpi: 'Customer Satisfaction Score',
    target: '85%',
    calculation: 'Survey data',
    platform: 'Customer Feedback System',
    responsibleDGM: 'Pro. DGM',
    definedOLADetails: 'Response time within 24 hours',
    dataSources: 'Customer surveys, feedback forms'
  }
];

@Component({
  selector: 'app-admin-tm-activity-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './tm-activity-plan.component.html',
  styleUrls: ['./tm-activity-plan.component.scss']
})
export class AdminTmActivityPlanComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'TM Activity Plan';
  records: ActivityRecord[] = [...MOCK_ACTIVITY_RECORDS];
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
      .get<ActivityRecord[]>('/api/repeated-hardcode-tab1')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.records = response?.length ? response : [...MOCK_ACTIVITY_RECORDS];
        },
        error: err => {
          console.error('Failed to fetch data', err);
          this.errorMessage = 'Unable to load TM activities right now. Showing sample data.';
          this.records = [...MOCK_ACTIVITY_RECORDS];
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
      ? this.http.put(`/api/repeated-hardcode-tab1/update/${this.editingId}`, payload)
      : this.http.post('/api/repeated-hardcode-tab1/add', payload);

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

  onEdit(record: ActivityRecord): void {
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
      .delete(`/api/repeated-hardcode-tab1/delete/${id}`)
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

