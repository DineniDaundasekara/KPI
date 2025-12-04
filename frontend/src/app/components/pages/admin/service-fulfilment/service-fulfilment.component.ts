import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule 
} from '@angular/forms';

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
  activeKpis = 8;
  targetsMet = 87;
  avgWeightage = 12.5;
  dgmCount = 5;
  
  // Form
  kpiForm: FormGroup;
  isEditing = false;
  editingIndex: number | null = null;
  
  // DGM list for dropdown
  dgmList = [
    'John Anderson',
    'Sarah Mitchell',
    'Robert Chen',
    'Emma Wilson',
    'Michael Brown'
  ];
  
  // Sample KPI data
  kpiList: any[] = [
    {
      no: 'KPI-001',
      kpi: 'First Response Time',
      target: '≤ 2 hours',
      calculation: 'Time from ticket creation to first agent response',
      platform: 'CRM',
      responsibleDgm: 'John Anderson',
      definedOla: 'Response within 2 hours during business hours (9 AM - 6 PM)',
      weightage: 15,
      dataSources: 'Ticketing System, Customer Service Portal'
    },
    {
      no: 'KPI-002',
      kpi: 'Resolution Rate',
      target: '95%',
      calculation: '(Resolved tickets / Total tickets) × 100',
      platform: 'Web',
      responsibleDgm: 'Sarah Mitchell',
      definedOla: '95% of tickets resolved within agreed SLA timeframe',
      weightage: 20,
      dataSources: 'Ticketing System, Customer Feedback'
    },
    {
      no: 'KPI-003',
      kpi: 'Customer Satisfaction',
      target: '≥ 4.5/5',
      calculation: 'Average of post-resolution survey scores',
      platform: 'Mobile',
      responsibleDgm: 'Robert Chen',
      definedOla: 'Maintain CSAT score above 4.5 for all service categories',
      weightage: 25,
      dataSources: 'Survey System, Customer Feedback Portal'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.kpiForm = this.fb.group({
      no: ['', Validators.required],
      kpi: ['', Validators.required],
      target: ['', Validators.required],
      calculation: ['', Validators.required],
      platform: ['', Validators.required],
      responsibleDgm: ['', Validators.required],
      definedOla: ['', Validators.required],
      weightage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      dataSources: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.updateStatistics();
  }

  // Update statistics based on current KPI list
  updateStatistics() {
    this.activeKpis = this.kpiList.length;
    
    if (this.kpiList.length > 0) {
      const totalWeightage = this.kpiList.reduce((sum, kpi) => sum + kpi.weightage, 0);
      this.avgWeightage = Math.round((totalWeightage / this.kpiList.length) * 10) / 10;
      
      // Count unique DGMs
      const uniqueDgms = new Set(this.kpiList.map(kpi => kpi.responsibleDgm));
      this.dgmCount = uniqueDgms.size;
    }
  }

  // Add new KPI
  addNewKpi() {
    this.isEditing = false;
    this.editingIndex = null;
    this.kpiForm.reset({
      weightage: 0
    });
  }

  // Edit existing KPI
  editKpi(index: number) {
    this.isEditing = true;
    this.editingIndex = index;
    const kpi = this.kpiList[index];
    this.kpiForm.patchValue(kpi);
    
    // Scroll to form
    const formElement = document.querySelector('.form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Delete KPI
  deleteKpi(index: number) {
    if (confirm('Are you sure you want to delete this KPI?')) {
      this.kpiList.splice(index, 1);
      this.updateStatistics();
    }
  }

  // Submit form (save or update)
  onSubmit() {
    if (this.kpiForm.valid) {
      const kpiData = this.kpiForm.value;
      
      if (this.isEditing && this.editingIndex !== null) {
        // Update existing KPI
        this.kpiList[this.editingIndex] = { ...kpiData };
      } else {
        // Add new KPI
        this.kpiList.unshift({ ...kpiData });
      }
      
      this.resetForm();
      this.updateStatistics();
    }
  }

  // Reset form
  resetForm() {
    this.kpiForm.reset({
      weightage: 0
    });
    this.isEditing = false;
    this.editingIndex = null;
  }
}