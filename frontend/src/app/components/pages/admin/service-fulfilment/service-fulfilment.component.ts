import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Form4ApiService, ServiceFulfilmentKpi } from '../../../../services/form4api.service';

@Component({
  selector: 'app-admin-service-fulfilment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-fulfilment.component.html',
  styleUrls: ['./service-fulfilment.component.scss']
})
export class AdminServiceFulfilmentComponent implements OnInit {

  // Header
  pageTitle = 'Service Fulfilment KPIs';

  // Dashboard stats
  activeKpis = 0;
  targetsMet = 0;
  avgWeightage = 0;
  dgmCount = 0;

  // Form
  kpiForm!: FormGroup;
  isEditing = false;
  editingId: string | null = null;

  // Table data
  kpiList: ServiceFulfilmentKpi[] = [];

  loading = false;
  saving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private form4Api: Form4ApiService
  ) {}

  ngOnInit(): void {
    this.kpiForm = this.fb.group({
      no: ['', Validators.required],
      kpi: ['', Validators.required],
      target: ['', Validators.required],
      calculation: ['', Validators.required],
      platform: ['', Validators.required],
      responsibleDgm: ['', Validators.required],
      definedOla: ['', Validators.required],
      weightage: ['', Validators.required],
      dataSources: ['', Validators.required],
      month: [11, Validators.required],
      year: [2025, Validators.required]
    });

    this.loadKpis();
  }

  // ================= LOAD =================
  loadKpis(): void {
    this.loading = true;

    this.form4Api.getAll().subscribe({
      next: data => {
        this.kpiList = data;
        this.activeKpis = data.length;
        this.avgWeightage =
          data.reduce((sum, k) => sum + k.weightage, 0) / (data.length || 1);
        this.dgmCount = new Set(data.map(k => k.responsibleDgm)).size;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load KPI data';
        this.loading = false;
      }
    });
  }

  // ================= ADD =================
  addNewKpi(): void {
    this.isEditing = false;
    this.editingId = null;
    this.kpiForm.reset();
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.kpiForm.invalid) {
      this.kpiForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.kpiForm.value,
      definedoladetails: this.kpiForm.value.definedOla
    };

    this.saving = true;

    const request$ = this.isEditing && this.editingId
      ? this.form4Api.update(this.editingId, payload)
      : this.form4Api.add(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadKpis();
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Save failed';
        this.saving = false;
      },
      complete: () => this.saving = false
    });
  }

  // ================= EDIT =================
  editKpi(index: number): void {
    const kpi = this.kpiList[index];
    this.isEditing = true;
    this.editingId = kpi.id ?? (kpi as any).Id;

    this.kpiForm.patchValue({
      no: kpi.no,
      kpi: kpi.kpi,
      target: kpi.target,
      calculation: kpi.calculation,
      platform: kpi.platform,
      responsibleDgm: kpi.responsibleDgm,
      definedOla: (kpi as any).definedoladetails ?? '',
      weightage: kpi.weightage,
      dataSources: kpi.dataSources,
      month: kpi.month,
      year: kpi.year
    });
  }

  // ================= DELETE =================
  deleteKpi(index: number): void {
    const kpi = this.kpiList[index];
    const id = kpi.id ?? (kpi as any).Id;

    if (!id || !confirm('Delete this KPI?')) return;

    this.form4Api.delete(id).subscribe({
      next: () => this.loadKpis(),
      error: err => {
        console.error(err);
        this.errorMessage = 'Delete failed';
      }
    });
  }

  // ================= RESET =================
  resetForm(): void {
    this.kpiForm.reset();
    this.isEditing = false;
    this.editingId = null;
  }
}
