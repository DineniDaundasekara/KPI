import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

// ✅ update import path if needed
import { Form4ApiService, Form4Row } from '../../../../services/form4-api.service';

@Component({
  selector: 'app-admin-service-fulfilment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-fulfilment.component.html',
  styleUrls: ['./service-fulfilment.component.scss']
})
export class AdminServiceFulfilmentComponent implements OnInit {
  pageTitle = 'Admin — Service Fulfilment';

  // Statistics data
  activeKpis = 0;
  targetsMet = 87; // (your own logic later)
  avgWeightage = 0;
  dgmCount = 0;

  // Form
  kpiForm!: FormGroup;
  isEditing = false;
  editingIndex: number | null = null;

  // DGM list
  dgmList = [
    'John Anderson',
    'Sarah Mitchell',
    'Robert Chen',
    'Emma Wilson',
    'Michael Brown'
  ];

  // ✅ Now this is loaded from DB (not sample data)
  kpiList: any[] = [];

  constructor(private fb: FormBuilder, private api: Form4ApiService) {
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
  }

  ngOnInit() {
    this.loadData(); // ✅ load from DB when open page
  }

  // ✅ GET ALL from DB
  loadData() {
    this.api.getAll().subscribe({
      next: (rows) => {
        this.kpiList = rows.map(r => ({
          id: r.id,
          no: r.no,
          kpi: r.kpi,
          target: r.target,
          calculation: r.calculation,
          platform: r.platform,
          responsibleDgm: r.responsibledgm,
          definedOla: r.definedoladetails,
          weightage: r.weightage ?? 0,
          dataSources: r.datasources
        }));

        this.updateStatistics();
      },
      error: (err) => {
        console.error('GET error:', err);
      }
    });
  }

  // Update statistics
  updateStatistics() {
    this.activeKpis = this.kpiList.length;

    if (this.kpiList.length > 0) {
      const totalWeightage = this.kpiList.reduce((sum: number, kpi: any) => sum + (Number(kpi.weightage) || 0), 0);
      this.avgWeightage = Math.round((totalWeightage / this.kpiList.length) * 10) / 10;

      const uniqueDgms = new Set(this.kpiList.map((kpi: any) => kpi.responsibleDgm));
      this.dgmCount = uniqueDgms.size;
    } else {
      this.avgWeightage = 0;
      this.dgmCount = 0;
    }
  }

  // Add new KPI
  addNewKpi() {
    this.isEditing = false;
    this.editingIndex = null;
    this.kpiForm.reset({ weightage: 0 });

    // Optional scroll
    const formElement = document.querySelector('.form-container');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Edit KPI
  editKpi(index: number) {
    this.isEditing = true;
    this.editingIndex = index;

    const kpi = this.kpiList[index];
    this.kpiForm.patchValue({
      no: kpi.no,
      kpi: kpi.kpi,
      target: kpi.target,
      calculation: kpi.calculation,
      platform: kpi.platform,
      responsibleDgm: kpi.responsibleDgm,
      definedOla: kpi.definedOla,
      weightage: kpi.weightage,
      dataSources: kpi.dataSources
    });

    const formElement = document.querySelector('.form-container');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ✅ DELETE from DB
  deleteKpi(index: number) {
    const row = this.kpiList[index];
    if (!row?.id) return;

    if (confirm('Are you sure you want to delete this KPI?')) {
      this.api.delete(row.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('DELETE error:', err)
      });
    }
  }

  // ✅ POST / PUT to DB
  onSubmit() {
    if (this.kpiForm.invalid) return;

    const v = this.kpiForm.value;

    const id =
      this.isEditing && this.editingIndex !== null
        ? this.kpiList[this.editingIndex].id
        : `KPI-${Date.now()}`;

    const payload: Form4Row = {
      id,
      no: Number(v.no),
      kpi: v.kpi,
      target: v.target,
      calculation: v.calculation,
      platform: v.platform,
      responsibledgm: v.responsibleDgm,
      definedoladetails: v.definedOla,
      weightage: Number(v.weightage),
      datasources: v.dataSources,

      // ✅ NOT NULL string fields (default "0")
      CENHKMD: "0", CENHKMD1: "0", GQKINTB: "0", NDRM: "0", AWHO: "0",
      KONKX: "0", NGWT: "0", KGKLY: "0", CWPX: "0", DBKYMT: "0",
      GPHTNW: "0", ADPR: "0", BDBWMRG: "0", KERN: "0", EBMHMBH: "0",
      AGGL: "0", HRKTPH: "0", BCAPKLTC: "0", JA: "0", KOMLTMBVA: "0",

      v: 1,

      // ✅ NOT NULL numeric area fields (default 0)
      areas_CENHKMD: 0,
      areas_CENHKMD1: 0,
      areas_GQKINTB: 0,
      areas_NDRM: 0,
      areas_AWHO: 0,
      areas_KONKX: 0,
      areas_NGWT: 0,
      areas_KGKLY: 0,
      areas_CWPX: 0,
      areas_DBKYMT: 0,
      areas_GPHTNW: 0,
      areas_ADPR: 0,
      areas_BDBWMRG: 0,
      areas_KERN: 0,
      areas_EBMHMBH: 0,
      areas_AGGL: 0,
      areas_HRKTPH: 0,
      areas_BCAPKLTC: 0,
      areas_JA: 0,
      areas_KOMLTMBVA: 0,

      updatedAt: new Date().toISOString().slice(0, 10),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    };

    if (this.isEditing && this.editingIndex !== null) {
      // ✅ PUT
      this.api.update(payload.id, payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadData();
        },
        error: (err) => console.error('PUT error:', err)
      });
    } else {
      // ✅ POST
      this.api.create(payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadData();
        },
        error: (err) => console.error('POST error:', err)
      });
    }
  }

  // Reset form
  resetForm() {
    this.kpiForm.reset({ weightage: 0 });
    this.isEditing = false;
    this.editingId = null;
  }
}
