import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServiceFulfilmentKpiDto, ServiceFulfilmentKpiService } from '../../../../services/service-fulfilment-kpi.service';

@Component({
  selector: 'app-admin-service-fulfilment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-fulfilment.component.html',
  styleUrls: ['./service-fulfilment.component.scss']
})
export class AdminServiceFulfilmentComponent implements OnInit {
  private readonly defaultMonth = 11;
  private readonly defaultYear = 2025;
  private readonly document = inject(DOCUMENT);

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
  showForm = false;

  // Table data
  kpiList: ServiceFulfilmentKpiDto[] = [];

  loading = false;
  saving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private serviceFulfilmentKpiService: ServiceFulfilmentKpiService
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
      month: [this.defaultMonth, Validators.required],
      year: [this.defaultYear, Validators.required]
    });

    this.loadKpis();
  }

  // ================= LOAD =================
  loadKpis(): void {
    this.loading = true;

    this.serviceFulfilmentKpiService.getAll().subscribe({
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
    this.resetForm();
    this.showForm = true;
    this.scrollFormIntoView();
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.kpiForm.invalid) {
      this.kpiForm.markAllAsTouched();
      return;
    }

    const formValue = this.kpiForm.value;
    const definedOlaValue = (formValue.definedOla ?? '').toString().trim();

    const payload: ServiceFulfilmentKpiDto = {
      no: formValue.no,
      kpi: formValue.kpi,
      target: formValue.target,
      calculation: formValue.calculation,
      platform: formValue.platform,
      responsibleDgm: formValue.responsibleDgm,
      definedoladetails: definedOlaValue,
      dataSources: formValue.dataSources,
      weightage: formValue.weightage,
      month: formValue.month,
      year: formValue.year
    };

    this.saving = true;

    const request$ = this.isEditing && this.editingId
      ? this.serviceFulfilmentKpiService.update(this.editingId, payload)
      : this.serviceFulfilmentKpiService.add(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadKpis();
        this.showForm = false;
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
    const definedOlaValue = this.resolveDefinedOlaValue(kpi);

    this.kpiForm.patchValue({
      no: kpi.no,
      kpi: kpi.kpi,
      target: kpi.target,
      calculation: kpi.calculation,
      platform: kpi.platform,
      responsibleDgm: kpi.responsibleDgm,
      definedOla: definedOlaValue,
      weightage: kpi.weightage,
      dataSources: kpi.dataSources,
      month: kpi.month,
      year: kpi.year
    });
    this.showForm = true;
    this.scrollFormIntoView();
  }

  // ================= DELETE =================
  deleteKpi(index: number): void {
    const kpi = this.kpiList[index];
    const id = kpi.id ?? (kpi as any).Id;

    if (!id || !confirm('Delete this KPI?')) return;

    this.serviceFulfilmentKpiService.delete(id).subscribe({
      next: () => this.loadKpis(),
      error: err => {
        console.error(err);
        this.errorMessage = 'Delete failed';
      }
    });
  }

  // ================= RESET =================
  resetForm(): void {
    this.kpiForm.reset({
      month: this.defaultMonth,
      year: this.defaultYear
    });
    this.isEditing = false;
    this.editingId = null;
  }

  toggleForm(): void {
    if (this.showForm) {
      this.closeForm();
    } else {
      this.addNewKpi();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  private scrollFormIntoView(): void {
    setTimeout(() => {
      if (!this.showForm) {
        return;
      }
      const element = this.document?.getElementById('service-fulfilment-form');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private resolveDefinedOlaValue(kpi?: Partial<ServiceFulfilmentKpiDto>): string {
    if (!kpi) {
      return '';
    }
    const direct = (kpi as any).definedoladetails ?? (kpi as any).defineDoladetails;
    return typeof direct === 'string' ? direct : '';
  }
}
