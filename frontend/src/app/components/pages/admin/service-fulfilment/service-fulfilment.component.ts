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

  pageTitle = 'Service Fulfilment KPIs';

  activeKpis = 0;
  targetsMet = 0;
  avgWeightage = 0;
  dgmCount = 0;

  kpiForm!: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  showForm = false;

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
      next: (data) => {
        this.kpiList = data;
        this.activeKpis = data.length;

        this.avgWeightage =
          data.reduce((sum, k) => sum + k.weightage, 0) / (data.length || 1);

        this.dgmCount = new Set(data.map(k => k.responsibleDgm)).size;
        this.targetsMet = data.length ? 100 : 0;

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load KPI data';
        this.loading = false;
      }
    });
  }

  // ================= ADD =================
  addNewKpi(): void {
    this.showForm = true;
    this.isEditing = false;
    this.editingId = null;
    this.kpiForm.reset({ month: 11, year: 2025 });
    setTimeout(() => this.scrollToForm(), 100);
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.kpiForm.invalid) {
      this.kpiForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const formValue = this.kpiForm.value;
    const payload: ServiceFulfilmentKpi = {
      ...formValue,
      defineDoladetails: formValue.definedOla
    };
    delete (payload as any).definedOla;

    const request$ =
      this.isEditing && this.editingId
        ? this.form4Api.update(this.editingId, payload)
        : this.form4Api.add(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadKpis();
      },
      error: () => {
        this.errorMessage = 'Save failed';
        this.saving = false;
      },
      complete: () => (this.saving = false)
    });
  }

  // ================= EDIT =================
  editKpi(index: number): void {
    const kpi = this.kpiList[index];

    this.showForm = true;
    this.isEditing = true;
    this.editingId = kpi.id!;

    this.kpiForm.patchValue({
      no: kpi.no,
      kpi: kpi.kpi,
      target: kpi.target,
      calculation: kpi.calculation,
      platform: kpi.platform,
      responsibleDgm: kpi.responsibleDgm,
      definedOla: kpi.defineDoladetails,
      weightage: kpi.weightage,
      dataSources: kpi.dataSources,
      month: kpi.month,
      year: kpi.year
    });

    setTimeout(() => this.scrollToForm(), 100);
  }

  // ================= DELETE =================
  deleteKpi(index: number): void {
    const id = this.kpiList[index].id;
    if (!id || !confirm('Delete this KPI?')) return;

    this.form4Api.delete(id).subscribe(() => this.loadKpis());
  }

  // ================= RESET =================
  resetForm(): void {
    this.kpiForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.showForm = false;
  }

  // ================= SCROLL =================
  scrollToForm(): void {
    document.querySelector('.form-container')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
