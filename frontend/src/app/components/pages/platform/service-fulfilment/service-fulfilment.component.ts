import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { Form4ApiService, ServiceFulfilmentKpi } from '../../../../services/form4api.service';
import { RegionService, Region } from '../../../../services/region.service';

interface KpiData {
  _id: { $oid: string } | number;
  no: number;
  kpi: string;
  target: string;
  calculation: string;
  platform: string;
  responsibledgm: string;
  defineDoladetails?: string;
  definedoladetails?: string; // legacy key from sample data
  weightage: string;
  datasources: string;
  areas?: { [key: string]: number };
  updatedAt?: { $date: string };
  __v?: number;
  [key: string]: any; // For dynamic area columns
}

interface RegionData {
  id?: number;
  region: string;
  province: string;
  networkEngineer: string;
  lea: string;
}

@Component({
  selector: 'app-service-fulfilment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-fulfilment.component.html',
  styleUrls: ['./service-fulfilment.component.scss']
})
export class ServiceFulfilmentComponent implements OnInit {
  pageTitle = 'Platform KPI — Service Fulfilment';
  
  // Form values
  formValues = {
    dropdown1: '',
    dropdown2: '',
    dropdown3: '',
    dropdown4: ''
  };

  // Data
  data: KpiData[] = [];
  regionTable: RegionData[] = [];
  adminKpiRows: ServiceFulfilmentKpi[] = [];
  filteredKpiRows: ServiceFulfilmentKpi[] = [];
  editingCell: { rowId: string | number | null, key: string | null } = { rowId: null, key: null };
  
  // Dropdown options
  dropdown2Options: string[] = [];
  dropdown3Options: string[] = [];
  dropdown4Options: string[] = [];
  
  // Columns
  visibleColumns: string[] = [];
  
  // States
  loading = true;
  error: string | null = null;
  isEditingAllowed = true;
  userRole: string = 'user';
  
  // Constants
  nonEditableColumns = [
    'no', 'kpi', 'target', 'calculation', 'platform', 'responsibledgm',
    'defineDoladetails', 'weightage', 'datasources'
  ];

  baseColumns = [
    'no', 'kpi', 'target', 'calculation', 'platform', 'responsibledgm',
    'defineDoladetails', 'weightage', 'datasources'
  ];

  headerMapping: { [key: string]: string } = {
    no: 'No',
    kpi: 'KPI',
    target: 'Target',
    calculation: 'Calculation',
    platform: 'Platform',
    responsibledgm: 'Responsible DGM',
    defineDoladetails: 'Defined OLA Details',
    weightage: 'Weightage',
    datasources: 'Data Sources'
  };

  optionMapping: { [key: string]: string } = {
    CENHKMD: 'CEN / MD',
    CENHKMD1: 'HK',
    GQKINTB: 'GQ / KI / NTB',
    NDRM: 'ND / RM',
    AWHO: 'AW / HO',
    KONKX: 'KON / KK',
    NGWT: 'NG / WT',
    KGKLY: 'KG / KLY',
    CWPX: 'CW / PX',
    DBKYMT: 'DB / KY / MT',
    GPHTNW: 'GP / HT / NW',
    ADPR: 'AD / PR',
    BDBWMRG: 'BD / BW / MRG',
    KERN: 'KE / RN',
    EBMHMBH: 'EMB / HB / MH',
    AGGL: 'AG / GL',
    HRKTPH: 'HR / KT / PH',
    BCAPKLTC: 'BC / AP / KL / TC',
    JA: 'JA',
    KOMLTMBVA: 'KO / MLT / MB / VA'
  };

  // Real KPI data from JSON
  realKpiData: KpiData[] = [
    {
      "_id": { "$oid": "675ab58faad5ca39476a3d12" },
      "no": 1,
      "kpi": "Identification of proper CEA Node and customer location code creation in OSS for delivering services(IDNENTIFY FACILITIES)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "2 Days",
      "weightage": "10%",
      "datasources": "OSS Reports",
      "CENHKMD": "96%",
      "CENHKMD1": "95.45%",
      "GQKINTB": "100%",
      "NDRM": "100%",
      "AWHO": "66.67%",
      "KONKX": "100%",
      "NGWT": "75%",
      "KGKLY": "14.29%",
      "CWPX": "0%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "50%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 90,
        "CENHKMD1": 95.45,
        "GQKINTB": 1000,
        "NDRM": 100,
        "AWHO": 66.67,
        "KONKX": 100,
        "NGWT": 75,
        "KGKLY": 14.29,
        "CWPX": 0,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 90,
        "BDBWMRG": 50,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100,
        "GQ / KI / NTB": 60,
        "CW / PX": 12
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.478Z" }
    },
    {
      "_id": { "$oid": "675af2109e8685204fde9390" },
      "no": 2,
      "kpi": "Assign fiber cores and completion of X-connections in OSS if end to end fiber available. If not inform whether finber is not available or incompete and complete other required OSS attributes. (RESERVE ACCESS FIBER)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "2 Days",
      "weightage": "20%",
      "datasources": "OSS Reports",
      "CENHKMD": "68.75%",
      "CENHKMD1": "68.75%",
      "GQKINTB": "100%",
      "NDRM": "83.33%",
      "AWHO": "0%",
      "KONKX": "100%",
      "NGWT": "100%",
      "KGKLY": "77.78%",
      "CWPX": "100%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "100%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 68.75,
        "CENHKMD1": 68.75,
        "GQKINTB": 100,
        "NDRM": 83.33,
        "AWHO": 0,
        "KONKX": 100,
        "NGWT": 100,
        "KGKLY": 77.78,
        "CWPX": 100,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 100,
        "BDBWMRG": 100,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.796Z" }
    },
    {
      "_id": { "$oid": "675af5109e8685204fde9394" },
      "no": 3,
      "kpi": "Completion of live joint splicing and termination. (SPLICE & TERMINATE)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "5 Days",
      "weightage": "20%",
      "datasources": "OSS Reports",
      "CENHKMD": "100%",
      "CENHKMD1": "100%",
      "GQKINTB": "100%",
      "NDRM": "100%",
      "AWHO": "100%",
      "KONKX": "100%",
      "NGWT": "100%",
      "KGKLY": "100%",
      "CWPX": "100%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "50%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "50%",
      "__v": 0,
      "areas": {
        "CENHKMD": 100,
        "CENHKMD1": 100,
        "GQKINTB": 100,
        "NDRM": 100,
        "AWHO": 100,
        "KONKX": 100,
        "NGWT": 100,
        "KGKLY": 100,
        "CWPX": 100,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 100,
        "BDBWMRG": 50,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 50
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.798Z" }
    },
    {
      "_id": { "$oid": "675af5a49e8685204fde9396" },
      "no": 4,
      "kpi": "Upload fiber information in to OSS after completing splicing. (UPLOAD FIBER IN OSS)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "2 Days",
      "weightage": "10%",
      "datasources": "OSS Reports",
      "CENHKMD": "50%",
      "CENHKMD1": "50%",
      "GQKINTB": "100%",
      "NDRM": "60%",
      "AWHO": "100%",
      "KONKX": "100%",
      "NGWT": "100%",
      "KGKLY": "100%",
      "CWPX": "100%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "50%",
      "BDBWMRG": "100%",
      "KERN": "0%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 50,
        "CENHKMD1": 50,
        "GQKINTB": 100,
        "NDRM": 60,
        "AWHO": 100,
        "KONKX": 100,
        "NGWT": 100,
        "KGKLY": 100,
        "CWPX": 100,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 50,
        "BDBWMRG": 100,
        "KERN": 0,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100,
        "GQ / KI / NTB": 10
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.801Z" }
    },
    {
      "_id": { "$oid": "675af63e9e8685204fde9398" },
      "no": 5,
      "kpi": "Assign new fiber cores and completion of X-connections in OSS after completing new fiber laying. (ASSIGN NEW ACCESS FIBER)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "2 Days",
      "weightage": "10%",
      "datasources": "OSS Reports",
      "CENHKMD": "100%",
      "CENHKMD1": "100%",
      "GQKINTB": "100%",
      "NDRM": "100%",
      "AWHO": "0%",
      "KONKX": "100%",
      "NGWT": "100%",
      "KGKLY": "100%",
      "CWPX": "0%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "100%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 100,
        "CENHKMD1": 100,
        "GQKINTB": 100,
        "NDRM": 100,
        "AWHO": 0,
        "KONKX": 100,
        "NGWT": 100,
        "KGKLY": 100,
        "CWPX": 0,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 100,
        "BDBWMRG": 100,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100,
        "NG / WT": 10,
        "HR /KT /PH": 90
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.803Z" }
    },
    {
      "_id": { "$oid": "675afa7f9e8685204fde939c" },
      "no": 6,
      "kpi": "Verify fiber termination, set up end to end connectivity, install NTU (SS/SFP), measure end to end power levels and update OSS attributes. (ESTABLISH ACCESS LINK)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "3 Days",
      "weightage": "20%",
      "datasources": "OSS Reports",
      "CENHKMD": "69.23%",
      "CENHKMD1": "69.23%",
      "GQKINTB": "100%",
      "NDRM": "100%",
      "AWHO": "100%",
      "KONKX": "100%",
      "NGWT": "60%",
      "KGKLY": "50%",
      "CWPX": "100%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "87.5%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "83.33%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 69.23,
        "CENHKMD1": 69.23,
        "GQKINTB": 100,
        "NDRM": 100,
        "AWHO": 100,
        "KONKX": 100,
        "NGWT": 60,
        "KGKLY": 50,
        "CWPX": 100,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 100,
        "BDBWMRG": 87.5,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 83.33,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100,
        "GQ / KI / NTB": 25
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.806Z" }
    },
    {
      "_id": { "$oid": "675afafe9e8685204fde939e" },
      "no": 7,
      "kpi": "Installation of NTUs (INSTALL NTU/MODIFY NTU FO)",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "3 Days",
      "weightage": "5%",
      "datasources": "OSS Reports",
      "CENHKMD": "100%",
      "CENHKMD1": "100%",
      "GQKINTB": "100%",
      "NDRM": "100%",
      "AWHO": "100%",
      "KONKX": "100%",
      "NGWT": "100%",
      "KGKLY": "100%",
      "CWPX": "100%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "100%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 100,
        "CENHKMD1": 100,
        "GQKINTB": 100,
        "NDRM": 100,
        "AWHO": 100,
        "KONKX": 100,
        "NGWT": 100,
        "KGKLY": 100,
        "CWPX": 100,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 100,
        "BDBWMRG": 100,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100,
        "GQ / KI / NTB": 80
      },
      "updatedAt": { "$date": "2025-10-10T08:52:31.858Z" }
    },
    {
      "_id": { "$oid": "675afb2f9e8685204fde93a0" },
      "no": 8,
      "kpi": "Installation of SHDSL cards",
      "target": "90%",
      "calculation": "WOO completed within OLA/Total WOO Received",
      "platform": "Fiber",
      "responsibledgm": "Regional DGM/DGM SF",
      "definedoladetails": "3 Days",
      "weightage": "4%",
      "datasources": "OSS Reports",
      "CENHKMD": "100%",
      "CENHKMD1": "100%",
      "GQKINTB": "100%",
      "NDRM": "100%",
      "AWHO": "100%",
      "KONKX": "100%",
      "NGWT": "100%",
      "KGKLY": "100%",
      "CWPX": "100%",
      "DBKYMT": "100%",
      "GPHTNW": "100%",
      "ADPR": "100%",
      "BDBWMRG": "100%",
      "KERN": "100%",
      "EBMHMBH": "100%",
      "AGGL": "100%",
      "HRKTPH": "100%",
      "BCAPKLTC": "100%",
      "JA": "100%",
      "KOMLTMBVA": "100%",
      "__v": 0,
      "areas": {
        "CENHKMD": 100,
        "CENHKMD1": 100,
        "GQKINTB": 100,
        "NDRM": 100,
        "AWHO": 100,
        "KONKX": 100,
        "NGWT": 100,
        "KGKLY": 100,
        "CWPX": 100,
        "DBKYMT": 100,
        "GPHTNW": 100,
        "ADPR": 100,
        "BDBWMRG": 100,
        "KERN": 100,
        "EBMHMBH": 100,
        "AGGL": 100,
        "HRKTPH": 100,
        "BCAPKLTC": 100,
        "JA": 100,
        "KOMLTMBVA": 100,
        "GQ / KI / NTB": 90,
        "KON / KX": 1000,
        "NG / WT": 90
      },
      "updatedAt": { "$date": "2025-10-10T08:52:32.133Z" }
    }
  ];

  // Region data (simplified for now - in real app, this would come from API)
  regionData: RegionData[] = [
    { id: 1, region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-2', lea: 'KOMLTMBVA' },
    { id: 2, region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-1', lea: 'JA' },
    { id: 3, region: 'Region 3', province: 'EP', networkEngineer: 'NW/EP', lea: 'BCAPKLTC' },
    { id: 4, region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/WPS', lea: 'HRKTPH' },
    { id: 5, region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPW', lea: 'AGGL' },
    { id: 6, region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPE', lea: 'EBMHMBH' },
    { id: 7, region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/SAB', lea: 'KERN' },
    { id: 8, region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/UVA', lea: 'BDBWMRG' },
    { id: 9, region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/NCP', lea: 'ADPR' },
    { id: 10, region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPS', lea: 'GPHTNW' },
    { id: 11, region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPN', lea: 'DBKYMT' },
    { id: 12, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPW', lea: 'CWPX' },
    { id: 13, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPE', lea: 'KGKLY' },
    { id: 14, region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/WPN', lea: 'NGWT' },
    { id: 15, region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPE', lea: 'KONKX' },
    { id: 16, region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSE', lea: 'AWHO' },
    { id: 17, region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSW', lea: 'NDRM' },
    { id: 18, region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPNE', lea: 'GQKINTB' },
    { id: 19, region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-2 (CEN/HKMD)', lea: 'CENHKMD' },
    { id: 20, region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-1 (CEN/HK/MD)', lea: 'CENHKMD1' }
  ];

  constructor(
    private toastr: ToastrService,
    private form4Api: Form4ApiService,
    private regionService: RegionService
  ) {}

  ngOnInit() {
    this.loadRegionTable();
    this.loadData();
    this.checkUserRole();
    this.setupEditPermissionCheck();
  }

  loadData() {
    this.loading = true;
    this.form4Api.getAll().subscribe({
      next: (kpis) => {
        this.adminKpiRows = Array.isArray(kpis) ? kpis : [];
        this.filteredKpiRows = this.adminKpiRows;  // Show all data initially
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load Service Fulfilment admin data:', err);
        this.adminKpiRows = [];
        this.filteredKpiRows = [];
        this.loading = false;
        this.error = 'Failed to load Service Fulfilment KPI data.';
      }
    });
  }

  loadRegionTable() {
    this.regionService.getAll().subscribe({
      next: (res: Region[] | any[]) => {
        const source = Array.isArray(res) ? res : [];
        const mapped: RegionData[] = source.map((item: any) => ({
          region: item.region ?? item.Region ?? '',
          province: item.province ?? item.Province ?? '',
          networkEngineer: item.networkEngineer ?? item.networkengineer ?? item.NetworkEngineer ?? '',
          lea: item.lea ?? item.leacode ?? item.leaCode ?? item.LEA ?? ''
        }));
        this.regionTable = mapped.length ? mapped : [...this.regionData];
      },
      error: (err) => {
        console.error('Failed to fetch region table from API, using local fallback:', err);
        this.regionTable = [...this.regionData];
      }
    });
  }

  checkUserRole() {
    // In real app, get from auth service or localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token or make API call to get role
      this.userRole = 'padmin'; // Default for testing
    } else {
      this.userRole = 'user';
    }
  }

  setupEditPermissionCheck() {
    this.checkEditPermission();
    // Check permission every minute
    setInterval(() => {
      this.checkEditPermission();
    }, 60000);
  }

  checkEditPermission(): boolean {
    // Only platform admins can edit
    const canEdit = this.userRole === 'padmin';
    this.isEditingAllowed = canEdit;
    return canEdit;
  }

  getUniqueRegions(): string[] {
    return Array.from(new Set(this.regionTable.map(r => r.region))).filter(Boolean);
  }

  updateDropdown2Options() {
    if (!this.formValues.dropdown1) {
      this.dropdown2Options = [];
      this.formValues.dropdown2 = '';
      return;
    }
    const provinces = Array.from(
      new Set(
        this.regionTable
          .filter(x => x.region === this.formValues.dropdown1)
          .map(x => x.province)
      )
    ).filter(Boolean);
    this.dropdown2Options = provinces;
    if (provinces.length > 0) {
      this.formValues.dropdown2 = provinces[0];
      this.updateDropdown3Options();
    } else {
      this.formValues.dropdown2 = '';
      this.dropdown3Options = [];
      this.dropdown4Options = [];
      this.visibleColumns = [...this.baseColumns];
    }
  }

  updateDropdown3Options() {
    if (!this.formValues.dropdown2 || !this.formValues.dropdown1) {
      this.dropdown3Options = [];
      this.formValues.dropdown3 = '';
      return;
    }
    const engineers = Array.from(
      new Set(
        this.regionTable
          .filter(x => 
            x.region === this.formValues.dropdown1 && 
            x.province === this.formValues.dropdown2
          )
          .map(x => x.networkEngineer)
      )
    ).filter(Boolean);
    this.dropdown3Options = engineers;
    if (engineers.length > 0) {
      this.formValues.dropdown3 = engineers[0];
      this.updateDropdown4Options();
    } else {
      this.formValues.dropdown3 = '';
      this.dropdown4Options = [];
      this.visibleColumns = [...this.baseColumns];
    }
  }

  updateDropdown4Options() {
    if (!this.formValues.dropdown3 || !this.formValues.dropdown1 || !this.formValues.dropdown2) {
      this.dropdown4Options = [];
      this.formValues.dropdown4 = '';
      return;
    }
    const leas = Array.from(
      new Set(
        this.regionTable
          .filter(x => 
            x.region === this.formValues.dropdown1 &&
            x.province === this.formValues.dropdown2 &&
            x.networkEngineer === this.formValues.dropdown3
          )
          .map(x => {
            const dbKey = Object.keys(this.optionMapping).find(
              key => this.optionMapping[key] === x.lea || key === x.lea
            );
            return dbKey || x.lea;
          })
      )
    ).filter(Boolean);
    this.dropdown4Options = leas;
    if (leas.length > 0) {
      this.formValues.dropdown4 = leas[0];
      this.updateVisibleColumns();
    } else {
      this.formValues.dropdown4 = '';
      this.visibleColumns = [...this.baseColumns];
    }
  }

  updateVisibleColumns() {
    if (this.formValues.dropdown4) {
      this.visibleColumns = [...this.baseColumns, this.formValues.dropdown4];
    } else {
      this.visibleColumns = [...this.baseColumns];
    }
  }

  onDropdownChange(field: string, value: string) {
    (this.formValues as any)[field] = value;
    
    switch (field) {
      case 'dropdown1':
        this.formValues.dropdown2 = '';
        this.formValues.dropdown3 = '';
        this.formValues.dropdown4 = '';
        this.dropdown3Options = [];
        this.dropdown4Options = [];
        this.visibleColumns = [...this.baseColumns];
        this.updateDropdown2Options();
        break;
      case 'dropdown2':
        this.formValues.dropdown3 = '';
        this.formValues.dropdown4 = '';
        this.dropdown4Options = [];
        this.visibleColumns = [...this.baseColumns];
        this.updateDropdown3Options();
        break;
      case 'dropdown3':
        this.formValues.dropdown4 = '';
        this.visibleColumns = [...this.baseColumns];
        this.updateDropdown4Options();
        break;
      case 'dropdown4':
        this.updateVisibleColumns();
        break;
    }
    
    // Apply filtering after any dropdown change
    this.applyFilters();
  }

  applyFilters() {
    // If all 4 filters are selected, filter the data
    if (this.formValues.dropdown1 && this.formValues.dropdown2 && 
        this.formValues.dropdown3 && this.formValues.dropdown4) {
      
      // Filter KPI rows based on all selected region criteria
      this.filteredKpiRows = this.adminKpiRows.filter(kpi => {
        // Check region filter
        if (kpi.region && kpi.region !== this.formValues.dropdown1) {
          return false;
        }
        
        // Check province filter
        if (kpi.province && kpi.province !== this.formValues.dropdown2) {
          return false;
        }
        
        // Check network engineer filter
        if (kpi.networkEngineer && kpi.networkEngineer !== this.formValues.dropdown3) {
          return false;
        }
        
        // Check lea filter
        if (kpi.lea) {
          const displayLea = this.optionMapping[this.formValues.dropdown4] || this.formValues.dropdown4;
          const kpiLea = kpi.lea;
          const dbKey = Object.keys(this.optionMapping).find(
            key => this.optionMapping[key] === kpiLea || key === kpiLea
          );
          const normalizedKpiLea = this.optionMapping[dbKey || ''] || kpiLea;
          
          if (normalizedKpiLea !== displayLea && kpiLea !== this.formValues.dropdown4) {
            return false;
          }
        }
        
        return true;
      });
    } else {
      // Show all data if filters are not fully selected
      this.filteredKpiRows = this.adminKpiRows;
    }
  }

  formatPercent(val: any): string {
    if (val === undefined || val === null || val === '') return '-';
    if (typeof val === 'number') {
      // Format to 2 decimal places
      return `${val.toFixed(2)}%`;
    }
    const s = String(val).trim();
    // Remove existing % and add back
    const cleanValue = s.replace(/%/g, '');
    const numValue = parseFloat(cleanValue);
    if (!isNaN(numValue)) {
      return `${numValue.toFixed(2)}%`;
    }
    return s.endsWith('%') ? s : `${s}%`;
  }

  getCellValue(item: KpiData, key: string): any {
    // First check direct property
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      return item[key];
    }
    
    // Then check areas object
    if (item.areas && typeof item.areas === 'object' && item.areas[key] !== undefined) {
      return item.areas[key];
    }
    
    // Try to normalize key for area lookup
    const normalizedKey = key.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (item.areas && item.areas[normalizedKey] !== undefined) {
      return item.areas[normalizedKey];
    }
    
    return null;
  }

  getRowId(item: KpiData): string | number {
    if (typeof item._id === 'object' && item._id.$oid) {
      return item._id.$oid;
    }
    return item._id as number;
  }

  startEdit(item: KpiData, key: string) {
    if (!this.isEditingAllowed || this.nonEditableColumns.includes(key)) return;
    this.editingCell = { rowId: this.getRowId(item), key };
  }

  cancelEdit() {
    this.editingCell = { rowId: null, key: null };
  }

  saveEdit(item: KpiData, key: string) {
    // In real implementation, this would update the backend
    this.editingCell = { rowId: null, key: null };
    this.toastr.success(`Updated ${this.headerMapping[key] || key} successfully!`, 'Success');
  }

  handleFieldChange(event: Event, rowId: string | number, key: string) {
    if (!this.isEditingAllowed) return;
    
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    this.data = this.data.map(item => {
      const currentRowId = this.getRowId(item);
      if (currentRowId !== rowId) return item;
      
      const updatedItem = { ...item };
      
      // Try to parse as number
      const cleanValue = value.replace(/%/g, '').trim();
      const numValue = parseFloat(cleanValue);
      
      if (!isNaN(numValue)) {
        updatedItem[key] = numValue;
        if (updatedItem.areas) {
          updatedItem.areas[key] = numValue;
        }
      } else {
        updatedItem[key] = value;
      }
      
      return updatedItem;
    });
  }

  saveAllChanges() {
    if (!this.isEditingAllowed) {
      this.toastr.error('You do not have permission to edit. Only Platform Admins can edit KPI data.', 'Permission Denied');
      return;
    }

    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.editingCell = { rowId: null, key: null };
      this.toastr.success('✅ All changes have been saved successfully!', 'Success', {
        timeOut: 2500,
        progressBar: true
      });
    }, 1500);
  }

  generateExcelReport() {
    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
      
      // Create Excel workbook
      const dataToExport = this.data.map(item => {
        const row: any = {};
        
        // Add all columns
        this.getColumnsToRender().forEach(col => {
          const value = this.getCellValue(item, col);
          row[this.headerMapping[col] || this.optionMapping[col] || col] = 
            this.nonEditableColumns.includes(col) ? value : this.formatPercent(value);
        });
        
        return row;
      });
      
      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI Report');
      
      // Generate and download
      const date = new Date().toISOString().split('T')[0];
      const filename = `KPI_Report_${date}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      this.toastr.success(`Excel report "${filename}" generated successfully!`, 'Report Generated');
    }, 2000);
  }

  getColumnsToRender(): string[] {
    if (this.visibleColumns.length === 0) {
      return this.baseColumns;
    }
    return Array.from(new Set(this.visibleColumns));
  }

  getAreaKeys(): string[] {
    const keys = new Set<string>();
    this.data.forEach(item => {
      if (item.areas) {
        Object.keys(item.areas).forEach(key => keys.add(key));
      }
      // Also check direct properties that look like area codes
      Object.keys(item).forEach(key => {
        if (/^[A-Z]+$/.test(key) && key.length <= 12 && !this.baseColumns.includes(key)) {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }

  getLastUpdated(item: KpiData): string {
    if (item.updatedAt && item.updatedAt.$date) {
      const date = new Date(item.updatedAt.$date);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'N/A';
  }
}