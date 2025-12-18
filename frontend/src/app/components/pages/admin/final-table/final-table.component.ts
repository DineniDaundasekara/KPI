import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type StrategicRecord = {
  _id: string;
  rowNumber: number;
  perspectives: string;
  strategicObjectives: string;
  keyPerformanceIndicators: string;
  unit: string;
  descriptionOfKPI: string;
  weightage: number;
};

const MOCK_STRATEGIC_RECORDS: StrategicRecord[] = [
  {
    _id: '6751fea8cb6fec660214976e',
    rowNumber: 2,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators: 'Fiber Failures Restoration (Large scale: Pole damages etc): < 8 Hrs',
    unit: '%',
    descriptionOfKPI: 'Above 80%',
    weightage: 8
  },
  {
    _id: '6751fea8cb6fec660214976f',
    rowNumber: 3,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators: 'MSAN Power Failures Restoration: < 4 Hrs',
    unit: '%',
    descriptionOfKPI: 'Above 85%',
    weightage: 8
  },
  {
    _id: '6751ffc7cb6fec6602149776',
    rowNumber: 6,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators: 'Routing maintenance',
    unit: '%',
    descriptionOfKPI: '100%',
    weightage: 3
  },
  {
    _id: '6751ffc7cb6fec6602149775',
    rowNumber: 5,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators:
      'Network Availability (MSAN, OLT, SLBN, SDH, Fiber NW, IP Core, Tellabs, Service Edge (CEA+PE))',
    unit: 'Rs. Mn',
    descriptionOfKPI: 'Above 99.899%',
    weightage: 7
  },
  {
    _id: '6751ffc7cb6fec6602149777',
    rowNumber: 7,
    perspectives: 'Customer',
    strategicObjectives: 'Service Fulfillment',
    keyPerformanceIndicators: 'Enterprise/SME and Whole Sales Service Delivery - Fiber',
    unit: '%',
    descriptionOfKPI: 'Above 90%',
    weightage: 35
  },
  {
    _id: '6751ffc7cb6fec6602149778',
    rowNumber: 8,
    perspectives: 'Financial',
    strategicObjectives: 'Project Delivery',
    keyPerformanceIndicators: 'FTTH Project delivery - Based on Provincial Target',
    unit: 'Ports',
    descriptionOfKPI: '100%',
    weightage: 8
  },
  {
    _id: '6751ffc7cb6fec6602149779',
    rowNumber: 9,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators: 'O&M of Power & Aircondition',
    unit: '%',
    descriptionOfKPI: 'Above 90%',
    weightage: 5
  },
  {
    _id: '6751ffc7cb6fec660214977a',
    rowNumber: 10,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators: 'Operation & Maintenance of SLT towers and tower premises',
    unit: '%',
    descriptionOfKPI: 'Above 95%',
    weightage: 10
  },
  {
    _id: '6751fea8cb6fec660214976d',
    rowNumber: 1,
    perspectives: 'Customer',
    strategicObjectives: 'Service Assurance',
    keyPerformanceIndicators: 'Fiber Failures Restoration (General): < 4 Hrs',
    unit: '%',
    descriptionOfKPI: 'Above 85%',
    weightage: 8
  }
];

@Component({
  selector: 'app-final-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './final-table.component.html',
  styleUrls: ['./final-table.component.scss']
})
export class FinalTableComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'Strategic KPI Management';
  records: StrategicRecord[] = [...MOCK_STRATEGIC_RECORDS];
  editingId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    rowNumber: ['', [Validators.required, Validators.min(1)]],
    perspectives: ['', Validators.required],
    strategicObjectives: ['', Validators.required],
    keyPerformanceIndicators: ['', Validators.required],
    unit: ['', Validators.required],
    descriptionOfKPI: ['', Validators.required],
    weightage: ['', [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http
      .get<StrategicRecord[]>('/api/final-data')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.records = response?.length ? response : [...MOCK_STRATEGIC_RECORDS];
        },
        error: err => {
          console.error('Failed to fetch data', err);
          this.errorMessage = 'Unable to load strategic KPIs. Showing sample snapshot.';
          this.records = [...MOCK_STRATEGIC_RECORDS];
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const request$ = this.editingId
      ? this.http.put(`/api/final-data/update/${this.editingId}`, payload)
      : this.http.post('/api/final-data/add', payload);

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
          this.errorMessage = 'Save failed. Please try again.';
        }
      });
  }

  onEdit(record: StrategicRecord): void {
    this.editingId = record._id;
    this.form.patchValue({
      rowNumber: record.rowNumber.toString(),
      perspectives: record.perspectives,
      strategicObjectives: record.strategicObjectives,
      keyPerformanceIndicators: record.keyPerformanceIndicators,
      unit: record.unit,
      descriptionOfKPI: record.descriptionOfKPI,
      weightage: record.weightage.toString()
    });
  }

  onDelete(id: string): void {
    if (!window.confirm('Delete this KPI row?')) {
      return;
    }

    this.saving = true;
    this.http
      .delete(`/api/final-data/delete/${id}`)
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

  private buildPayload() {
    const raw = this.form.getRawValue();
    return {
      rowNumber: Number(raw.rowNumber),
      perspectives: raw.perspectives?.trim(),
      strategicObjectives: raw.strategicObjectives?.trim(),
      keyPerformanceIndicators: raw.keyPerformanceIndicators?.trim(),
      unit: raw.unit?.trim(),
      descriptionOfKPI: raw.descriptionOfKPI?.trim(),
      weightage: Number(raw.weightage)
    } as const;
  }

  private resetForm(): void {
    this.form.reset({
      rowNumber: '',
      perspectives: '',
      strategicObjectives: '',
      keyPerformanceIndicators: '',
      unit: '',
      descriptionOfKPI: '',
      weightage: ''
    });
    this.editingId = null;
  }
}

