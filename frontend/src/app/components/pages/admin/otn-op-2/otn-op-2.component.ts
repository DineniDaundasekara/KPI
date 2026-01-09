import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { KpiService, KpiRecord } from '../../../../services/kpi.service';

@Component({
  selector: 'app-otn-op-2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otn-op-2.component.html',
  styleUrls: ['./otn-op-2.component.scss']
})
export class OtnOp2Component implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly kpiService = inject(KpiService);

  pageTitle = 'INT & NT OP_02';

  records: KpiRecord[] = [];
  editingId: string | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    no: [0, Validators.required],
    network_Engineer_Kpi: ['', Validators.required],
    division: ['', Validators.required],
    section: ['', Validators.required],
    kpi_Percent: [0, Validators.required]
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;

    this.kpiService.getAll().subscribe({
      next: data => {
        this.records = data;
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Failed to load KPI data';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: KpiRecord = {
      no: this.form.value.no!,
      network_Engineer_Kpi: this.form.value.network_Engineer_Kpi!,
      division: this.form.value.division!,
      section: this.form.value.section!,
      kpi_Percent: this.form.value.kpi_Percent!
    };

    this.saving = true;

    const request$ = this.editingId
      ? this.kpiService.update(this.editingId, payload)
      : this.kpiService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.fetchData();
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Save failed';
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  onEdit(record: KpiRecord): void {
    this.editingId = record.id!;

    this.form.patchValue({
      no: record.no,
      network_Engineer_Kpi: record.network_Engineer_Kpi,
      division: record.division,
      section: record.section,
      kpi_Percent: record.kpi_Percent
    });
  }

  onDelete(id?: string): void {
    if (!id || !confirm('Delete this record?')) return;

    this.saving = true;

    this.kpiService.delete(id).subscribe({
      next: () => this.fetchData(),
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Delete failed';
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      no: 0,
      network_Engineer_Kpi: '',
      division: '',
      section: '',
      kpi_Percent: 0
    });
    this.editingId = null;
  }
}
