import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { Form8Service } from '../../../../services/form8.service';

@Component({
  selector: 'app-otn-op-1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otn-op-1.component.html',
  styleUrls: ['./otn-op-1.component.scss']
})
export class OtnOp1Component implements OnInit {

  pageTitle = 'INT & NT OP_1';

  records: any[] = [];
  editingId: string | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  form!: any;

  constructor(
    private fb: FormBuilder,
    private form8Service: Form8Service
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      no: ['', Validators.required],
      network_Engineer_Kpi: ['', Validators.required],
      division: ['', Validators.required],
      section: ['', Validators.required],
      kpi_Percent: ['', Validators.required]
    });

    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.form8Service
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any[]) => (this.records = res),
        error: () => (this.errorMessage = 'Failed to load KPI data')
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;
    this.saving = true;

    const request$ = this.editingId
      ? this.form8Service.update(this.editingId, payload)
      : this.form8Service.add(payload);

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.fetchData();
        },
        error: () => (this.errorMessage = 'Save failed')
      });
  }

onEdit(record: any): void {
  this.editingId = record.Id;
  this.form.patchValue({
    no: record.No,
    network_Engineer_Kpi: record.Network_Engineer_Kpi,
    division: record.Division,
    section: record.Section,
    kpi_Percent: record.Kpi_Percent
  });
}
  onDelete(id: string): void {
    if (!confirm('Delete this record?')) return;

    this.saving = true;
    this.form8Service
      .delete(id)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.fetchData(),
        error: () => (this.errorMessage = 'Delete failed')
      });
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }
}
