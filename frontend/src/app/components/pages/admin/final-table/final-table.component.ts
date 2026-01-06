import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

/* =======================
   TYPES
======================= */

export type KpiDefinition = {
  id: string;
  rowNumber: number;
  perspectives: string;
  strategicObjectives: string;
  keyPerformanceIndicators: string;
  unit: string;
  descriptionOfKPI: string;
  weightage: number;

  // ✅ NEW
  pointsApplicable: number;

  month?: number;
  year?: number;
};

export type CreateKpiDefinitionRequest = {
  rowNumber: number;
  perspectives: string;
  strategicObjectives: string;
  keyPerformanceIndicators: string;
  unit: string;
  descriptionOfKPI: string;
  weightage: number;

  // ✅ NEW
  pointsApplicable: number;

  month: number;
  year: number;
};

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

  records: KpiDefinition[] = [];
  editingId: string | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  private readonly apiBase = 'http://localhost:5043/api/kpi-definitions';

  form = this.fb.nonNullable.group({
    rowNumber: [0, [Validators.required, Validators.min(1)]],
    perspectives: ['', [Validators.required]],
    strategicObjectives: ['', [Validators.required]],
    keyPerformanceIndicators: ['', [Validators.required]],
    unit: ['', [Validators.required]],
    descriptionOfKPI: ['', [Validators.required]],
    weightage: [0, [Validators.required, Validators.min(0)]],

    // ✅ NEW
    pointsApplicable: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<KpiDefinition[]>(this.apiBase)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.records = (res ?? []).sort((a, b) => a.rowNumber - b.rowNumber);
        },
        error: (err) => {
          console.error('GET /api/kpi-definitions failed:', err);
          this.errorMessage = 'Unable to load KPI definitions.';
          this.records = [];
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
      ? this.http.put(`${this.apiBase}/${this.editingId}`, payload)
      : this.http.post(this.apiBase, payload);

    this.saving = true;
    this.errorMessage = '';

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.fetchData();
        },
        error: (err) => {
          console.error('Save failed:', err);
          this.errorMessage = 'Save failed. Check backend validation / API errors.';
        }
      });
  }

  onEdit(record: KpiDefinition): void {
    this.editingId = record.id;

    this.form.setValue({
      rowNumber: record.rowNumber ?? 0,
      perspectives: record.perspectives ?? '',
      strategicObjectives: record.strategicObjectives ?? '',
      keyPerformanceIndicators: record.keyPerformanceIndicators ?? '',
      unit: record.unit ?? '',
      descriptionOfKPI: record.descriptionOfKPI ?? '',
      weightage: record.weightage ?? 0,

      // ✅ NEW
      pointsApplicable: record.pointsApplicable ?? 0,
    });

    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  }

  onDelete(id: string): void {
    if (!window.confirm('Delete this KPI row?')) return;

    this.saving = true;
    this.errorMessage = '';

    this.http
      .delete(`${this.apiBase}/${id}`)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.fetchData(),
        error: (err) => {
          console.error('Delete failed:', err);
          this.errorMessage = 'Delete failed.';
        }
      });
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  private buildPayload(): CreateKpiDefinitionRequest {
    const raw = this.form.getRawValue();
    const now = new Date();

    return {
      rowNumber: Number(raw.rowNumber),
      perspectives: raw.perspectives.trim(),
      strategicObjectives: raw.strategicObjectives.trim(),
      keyPerformanceIndicators: raw.keyPerformanceIndicators.trim(),
      unit: raw.unit.trim(),
      descriptionOfKPI: raw.descriptionOfKPI.trim(),
      weightage: Number(raw.weightage),

      // ✅ NEW
      pointsApplicable: Number(raw.pointsApplicable),

      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }

  private resetForm(): void {
    this.form.reset({
      rowNumber: 0,
      perspectives: '',
      strategicObjectives: '',
      keyPerformanceIndicators: '',
      unit: '',
      descriptionOfKPI: '',
      weightage: 0,

      // ✅ NEW
      pointsApplicable: 0,
    });

    this.editingId = null;
    this.errorMessage = '';
  }
}
