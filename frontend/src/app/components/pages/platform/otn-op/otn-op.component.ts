import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { firstValueFrom, forkJoin } from 'rxjs';

type Dict<T = any> = Record<string, T>;

interface RegionRow {
	region?: string;
	province?: string;
	networkEngineer?: string;
	lea?: string;
}

interface BaseEntry {
	_id: string;
	no: number;
	network_engineer_kpi: string;
	division: string;
	section: string;
	kpi_percent: number;
	formType: 'form8' | 'form9';
	isModified?: boolean;
}

interface Form8Entry extends BaseEntry {
	formType: 'form8';
	total_minutes?: Dict<any>;
	unavailable_minutes?: Dict<any>;
	total_nodes?: Dict<any>;
}

interface Form9Entry extends BaseEntry {
	formType: 'form9';
	Total_Failed_Links?: Dict<any>;
	Links_SLA_Not_Violated?: Dict<any>;
}

interface EditCellState {
	rowId: string | null;
	parentKey: string | null;
	childKey: string | null;
	value: string;
}

const MOCK_FORM9_DATA: Form9Entry[] = [
	{
		_id: '675bf36486740514a3edc615',
		no: 12,
		network_engineer_kpi: 'Fiber Failures Restoration(General): <4 Hrs',
		division: 'TRANSPORT & ACCESS',
		section: 'INT  & NT OP',
		kpi_percent: 0.85,
		formType: 'form9',
		Total_Failed_Links: {
			cenhkmd: '0',
			cenhkmd1: '0',
			gqkintb: '1',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '1',
			kgkly: '2',
			cwpx: '6',
			debkymt: '1',
			gphtnw: '6',
			adipr: '1',
			bddwmrg: '0',
			keirn: '2',
			embmbmh: '1',
			aggl: '0',
			hrktph: '3',
			bcjrdkltc: '1',
			ja: '0',
			komltmbva: '0',
		},
		Links_SLA_Not_Violated: {
			cenhkmd: '7',
			cenhkmd1: '0',
			gqkintb: '0',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '1',
			kgkly: '2',
			cwpx: '4',
			debkymt: '1',
			gphtnw: '6',
			adipr: '1',
			bddwmrg: '0',
			keirn: '2',
			embmbmh: '1',
			aggl: '0',
			hrktph: '0',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
	},
	{
		_id: '675bf61e86740514a3edc621',
		no: 13,
		network_engineer_kpi: 'Fiber Failures Restoration(Large scale< Pole damages etc>): <8 Hrs',
		division: 'TRANSPORT & ACCESS',
		section: 'INT  & NT OP',
		kpi_percent: 0.8,
		formType: 'form9',
		Total_Failed_Links: {
			cenhkmd: '0',
			cenhkmd1: '0',
			gqkintb: '0',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '0',
			kgkly: '2',
			cwpx: '2',
			debkymt: '14',
			gphtnw: '5',
			adipr: '0',
			bddwmrg: '0',
			keirn: '1',
			embmbmh: '1',
			aggl: '0',
			hrktph: '1',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
		Links_SLA_Not_Violated: {
			cenhkmd: '1',
			cenhkmd1: '0',
			gqkintb: '1',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '0',
			kgkly: '2',
			cwpx: '1',
			debkymt: '8',
			gphtnw: '4',
			adipr: '0',
			bddwmrg: '0',
			keirn: '1',
			embmbmh: '1',
			aggl: '0',
			hrktph: '0',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
	},
];

const MOCK_FORM8_DATA: Form8Entry[] = [
	{
		_id: '675bce5e86740514a3edc5e1',
		no: 8,
		network_engineer_kpi: 'SLBN NW Availability',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.999,
		formType: 'form8',
		unavailable_minutes: {
			cenhkmd: '0',
			cenhkmd1: '200',
			gqkintb: '10',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '0',
			kgkly: '10',
			cwpx: '0',
			debkymt: '0',
			gphtnw: '0',
			adipr: '0',
			bddwmrg: '0',
			keirn: '0',
			embmbmh: '0',
			aggl: '0',
			hrktph: '0',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
		total_minutes: {
			cenhkmd: '0',
			cenhkmd1: '223200',
			gqkintb: '267840',
			ndfrm: '223200',
			awho: '133920',
			konix: '178560',
			ngivt: '267840',
			kgkly: '89280',
			cwpx: '44640',
			debkymt: '133920',
			gphtnw: '133921',
			adipr: '267840',
			bddwmrg: '133920',
			keirn: '267840',
			embmbmh: '178560',
			aggl: '89280',
			hrktph: '133920',
			bcjrdkltc: '267840',
			ja: '44640',
			komltmbva: '267840',
		},
		total_nodes: {
			cenhkmd: '2',
			cenhkmd1: '5',
			gqkintb: '6',
			ndfrm: '5',
			awho: '3',
			konix: '4',
			ngivt: '6',
			kgkly: '2',
			cwpx: '1',
			debkymt: '3',
			gphtnw: '3',
			adipr: '6',
			bddwmrg: '3',
			keirn: '6',
			embmbmh: '4',
			aggl: '2',
			hrktph: '3',
			bcjrdkltc: '6',
			ja: '1',
			komltmbva: '6',
		},
	},
	{
		_id: '675bd3bb86740514a3edc5f6',
		no: 9,
		network_engineer_kpi: 'SDH NW availability',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.996,
		formType: 'form8',
		unavailable_minutes: {
			cenhkmd: '0',
			cenhkmd1: '0',
			gqkintb: '0',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '0',
			kgkly: '10',
			cwpx: '0',
			debkymt: '0',
			gphtnw: '0',
			adipr: '0',
			bddwmrg: '0',
			keirn: '0',
			embmbmh: '0',
			aggl: '0',
			hrktph: '0',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
		total_minutes: {
			cenhkmd: '44640',
			cenhkmd1: '5490720',
			gqkintb: '2098080',
			ndfrm: '848160',
			awho: '580320',
			konix: '1116000',
			ngivt: '1026720',
			kgkly: '1205280',
			cwpx: '624960',
			debkymt: '1740960',
			gphtnw: '1026720',
			adipr: '1785600',
			bddwmrg: '1339200',
			keirn: '1874880',
			embmbmh: '2499840',
			aggl: '982080',
			hrktph: '892800',
			bcjrdkltc: '2098080',
			ja: '982080',
			komltmbva: '178560',
		},
		total_nodes: {
			cenhkmd: '1',
			cenhkmd1: '123',
			gqkintb: '47',
			ndfrm: '19',
			awho: '13',
			konix: '25',
			ngivt: '23',
			kgkly: '27',
			cwpx: '14',
			debkymt: '39',
			gphtnw: '23',
			adipr: '40',
			bddwmrg: '30',
			keirn: '42',
			embmbmh: '56',
			aggl: '22',
			hrktph: '20',
			bcjrdkltc: '47',
			ja: '22',
			komltmbva: '4',
		},
	},
	{
		_id: '675bd83f86740514a3edc5ff',
		no: 10,
		network_engineer_kpi: 'Fiber NW availability',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.99,
		formType: 'form8',
		unavailable_minutes: {
			cenhkmd: '0',
			cenhkmd1: '0',
			gqkintb: '1379',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '59',
			kgkly: '1161',
			cwpx: '1131',
			debkymt: '7308',
			gphtnw: '2790',
			adipr: '164',
			bddwmrg: '0',
			keirn: '380',
			embmbmh: '613',
			aggl: '0',
			hrktph: '1471',
			bcjrdkltc: '1019',
			ja: '0',
			komltmbva: '0',
		},
		total_minutes: {
			cenhkmd: '133920',
			cenhkmd1: '54996480',
			gqkintb: '54416160',
			ndfrm: '20712960',
			awho: '20980800',
			konix: '28837440',
			ngivt: '19596960',
			kgkly: '18704160',
			cwpx: '6740640',
			debkymt: '62808480',
			gphtnw: '18614880',
			adipr: '31828320',
			bddwmrg: '20400480',
			keirn: '28033920',
			embmbmh: '33480000',
			aggl: '24060960',
			hrktph: '37854720',
			bcjrdkltc: '13570560',
			ja: '20980800',
			komltmbva: '22052160',
		},
		total_nodes: {
			cenhkmd: '3',
			cenhkmd1: '1232',
			gqkintb: '1219',
			ndfrm: '464',
			awho: '470',
			konix: '646',
			ngivt: '439',
			kgkly: '419',
			cwpx: '151',
			debkymt: '1407',
			gphtnw: '417',
			adipr: '713',
			bddwmrg: '457',
			keirn: '628',
			embmbmh: '750',
			aggl: '539',
			hrktph: '848',
			bcjrdkltc: '304',
			ja: '470',
			komltmbva: '494',
		},
	},
	{
		_id: '6763cc8e3e62f54c4c94e666',
		no: 5,
		network_engineer_kpi: 'International BH Availability',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.999,
		formType: 'form8',
		unavailable_minutes: {
			cenhkmd: '0',
			cenhkmd1: '0',
			gqkintb: '0',
			ndfrm: '0',
			awho: '0',
			konix: '0',
			ngivt: '0',
			kgkly: '10',
			cwpx: '0',
			debkymt: '0',
			gphtnw: '0',
			adipr: '0',
			bddwmrg: '0',
			keirn: '0',
			embmbmh: '0',
			aggl: '0',
			hrktph: '0',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
		total_minutes: {
			cenhkmd: '267840',
			cenhkmd1: '714240',
			gqkintb: '44640',
			ndfrm: '357120',
			awho: '89280',
			konix: '0',
			ngivt: '0',
			kgkly: '982080',
			cwpx: '44640',
			debkymt: '0',
			gphtnw: '0',
			adipr: '0',
			bddwmrg: '0',
			keirn: '89280',
			embmbmh: '580320',
			aggl: '178560',
			hrktph: '133920',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
		total_nodes: {
			cenhkmd: '6',
			cenhkmd1: '16',
			gqkintb: '1',
			ndfrm: '8',
			awho: '2',
			konix: '0',
			ngivt: '0',
			kgkly: '22',
			cwpx: '1',
			debkymt: '0',
			gphtnw: '0',
			adipr: '0',
			bddwmrg: '0',
			keirn: '2',
			embmbmh: '13',
			aggl: '4',
			hrktph: '3',
			bcjrdkltc: '0',
			ja: '0',
			komltmbva: '0',
		},
	},
];

const LOCAL_REGION_TABLE: RegionRow[] = [
	{ region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-2', lea: 'KOMLTMBVA' },
	{ region: 'Region 3', province: 'NP', networkEngineer: 'NW/NP-1', lea: 'JA' },
	{ region: 'Region 3', province: 'EP', networkEngineer: 'NW/EP', lea: 'BCAPKLTC' },
	{ region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/WPS', lea: 'HRKTPH' },
	{ region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPW', lea: 'AGGL' },
	{ region: 'Region 2', province: 'WPS & SP', networkEngineer: 'NW/SPE', lea: 'EMBMBMH' },
	{ region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/SAB', lea: 'KERN' },
	{ region: 'Region 2', province: 'SAB & UVA', networkEngineer: 'NW/UVA', lea: 'BDBWMRG' },
	{ region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/NCP', lea: 'ADPR' },
	{ region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPS', lea: 'GPHTNW' },
	{ region: 'Region 1', province: 'CP & NCP', networkEngineer: 'NW/CPN', lea: 'DBKYMT' },
	{ region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPW', lea: 'CWPX' },
	{ region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/NWPE', lea: 'KGKLY' },
	{ region: 'Region 1', province: 'WPN & NWP', networkEngineer: 'NW/WPN', lea: 'NGWT' },
	{ region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPE', lea: 'KONKX' },
	{ region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSE', lea: 'AWHO' },
	{ region: 'Metro', province: 'Metro 2', networkEngineer: 'NWWPSW', lea: 'NDRM' },
	{ region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPNE', lea: 'GQKINTB' },
	{ region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-2 (CEN/HK/MD)', lea: 'CENHKMD' },
	{ region: 'Metro', province: 'Metro 1', networkEngineer: 'NWWPC-1 (CEN/HK/MD)', lea: 'CENHKMD1' },
];

@Component({
	selector: 'app-otn-op',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './otn-op.component.html',
	styleUrls: ['./otn-op.component.scss'],
})
export class OtnOpComponent implements OnInit, OnDestroy {
	pageTitle = 'Platform KPI — OTN & Optical';

	form8Data: Form8Entry[] = [];
	form9Data: Form9Entry[] = [];
	regionTable: RegionRow[] = [...LOCAL_REGION_TABLE];

	loading = true;
	error: string | null = null;

	role: string | null = null;
	isEditingAllowed = false;

	readonly daysInMonth: number = new Date(
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		0
	).getDate();

	private permissionTimer: ReturnType<typeof setInterval> | null = null;

	formValues = {
		dropdown1: '',
		dropdown2: '',
		dropdown3: '',
		dropdown4: '',
	};

	dropdown2Options: string[] = [];
	dropdown3Options: string[] = [];
	dropdown4Options: string[] = [];

	editCell: EditCellState = {
		rowId: null,
		parentKey: null,
		childKey: null,
		value: '',
	};

	toasts: Array<{ id: number; type: 'success' | 'danger'; text: string }> = [];
	private toastId = 1;

	optionMapping: Record<string, string> = {
		cenhkmd: 'CEN/HK/MD',
		cenhkmd1: 'CEN/HK/MD',
		gqkintb: 'GQ / KI / NTB',
		ndfrm: 'ND / RM',
		awho: 'AW / HO',
		konix: 'KON / KX',
		ngivt: 'NG / WT',
		kgkly: 'KG / KLY',
		cwpx: 'CW / PX',
		debkymt: 'DB / KY / MT',
		gphtnw: 'GP / HT / NW',
		adipr: 'AD / PR',
		bddwmrg: 'BD / BW / MRG',
		keirn: 'KE / RN',
		embmbmh: 'EMB / HB / MH',
		aggl: 'AG / GL',
		hrktph: 'HR / KT / PH',
		bcjrdkltc: 'BC / AP / KL / TC',
		ja: 'JA',
		komltmbva: 'KO / MLT / MB / VA',
	};

	private friendlyToDbKey: Record<string, string> = {};
	private filtersInitialized = false;

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		this.buildFriendlyMap();
		this.loadRole();
		this.loadRegionTable();
		this.initializeFilters();
		this.loadData();

		this.permissionTimer = setInterval(() => this.refreshEditPermission(), 60000);
	}

	ngOnDestroy(): void {
		if (this.permissionTimer) {
			clearInterval(this.permissionTimer);
			this.permissionTimer = null;
		}
	}

	get regions(): string[] {
		return Array.from(
			new Set(this.regionTable.map((row) => row.region).filter(Boolean) as string[])
		);
	}

	get selectedKey(): string {
		return this.formValues.dropdown4 ? this.norm(this.formValues.dropdown4) : '';
	}

	get combinedData(): Array<Form8Entry | Form9Entry> {
		return [...this.form8Data, ...this.form9Data].sort((a, b) => a.no - b.no);
	}

	selectedPercentage(entry: Form8Entry | Form9Entry): string {
		if (!this.selectedKey) {
			return '';
		}

		if (entry.formType === 'form8') {
			const pct = this.calculatePercentageForm8(
				(entry as Form8Entry).total_minutes?.[this.selectedKey],
				(entry as Form8Entry).unavailable_minutes?.[this.selectedKey],
				(entry as Form8Entry).total_nodes?.[this.selectedKey]
			);
			return isNaN(pct) ? '' : `${pct.toFixed(2)}%`;
		}

		const pct = this.calculatePercentageForm9(
			(entry as Form9Entry).Total_Failed_Links?.[this.selectedKey],
			(entry as Form9Entry).Links_SLA_Not_Violated?.[this.selectedKey]
		);
		return isNaN(pct) ? '' : `${pct.toFixed(2)}%`;
	}

	getTotalMinutesDisplay(entry: Form8Entry | Form9Entry): string {
		if (entry.formType !== 'form8' || !this.selectedKey) {
			return '';
		}

		const manual = Number((entry as Form8Entry).total_minutes?.[this.selectedKey]) || 0;
		const nodes = Number((entry as Form8Entry).total_nodes?.[this.selectedKey]) || 0;
		const computed = 24 * 60 * this.daysInMonth * nodes;
		const value = manual || computed;
		return value ? String(value) : '';
	}

	getForm8Value(
		entry: Form8Entry | Form9Entry,
		field: 'unavailable_minutes' | 'total_nodes'
	): string {
		if (entry.formType !== 'form8' || !this.selectedKey) {
			return '';
		}
		const payload = (entry as Form8Entry)[field] || {};
		return payload[this.selectedKey] ?? '';
	}

	getForm9Value(
		entry: Form8Entry | Form9Entry,
		field: 'Total_Failed_Links' | 'Links_SLA_Not_Violated'
	): string {
		if (entry.formType !== 'form9' || !this.selectedKey) {
			return '';
		}
		const payload = (entry as Form9Entry)[field] || {};
		return payload[this.selectedKey] ?? '';
	}

	private norm(value: string | null | undefined): string {
		return value ? value.replace(/[^A-Za-z0-9]/g, '').toLowerCase() : '';
	}

	private buildFriendlyMap(): void {
		const out: Record<string, string> = {};
		Object.keys(this.optionMapping).forEach((dbKey) => {
			out[this.norm(this.optionMapping[dbKey])] = dbKey;
			out[this.norm(dbKey)] = dbKey;
		});
		this.friendlyToDbKey = out;
	}

	private showToast(type: 'success' | 'danger', text: string): void {
		const id = this.toastId++;
		this.toasts.push({ id, type, text });
		setTimeout(() => this.dismissToast(id), 3000);
	}

	dismissToast(id: number): void {
		this.toasts = this.toasts.filter((toast) => toast.id !== id);
	}

	private refreshEditPermission(): void {
		this.isEditingAllowed = this.role === 'padmin';
	}

	loadRole(): void {
		const token = localStorage.getItem('token');
		if (!token) {
			this.role = null;
			this.isEditingAllowed = false;
			return;
		}

		const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
		this.http.get<any>('/auth/current-role', { headers }).subscribe({
			next: (res) => {
				this.role = res?.role ?? null;
				this.refreshEditPermission();
			},
			error: () => {
				this.role = null;
				this.isEditingAllowed = false;
				this.error = 'Failed to fetch role. Please log in again.';
			},
		});
	}

	loadRegionTable(): void {
		this.http.get<any>('/api/region-table').subscribe({
			next: (res) => {
				const rows = Array.isArray(res?.data) && res.data.length
					? res.data
					: Array.isArray(res) && res.length
					? res
					: LOCAL_REGION_TABLE;

				this.regionTable = [...rows];
				this.initializeFilters();
			},
			error: (err) => {
				console.error('Failed to fetch region table:', err);
				this.regionTable = [...LOCAL_REGION_TABLE];
				this.initializeFilters();
			},
		});
	}

	loadData(): void {
		this.loading = true;
		this.error = null;

		forkJoin({
			form8: this.http.get<Form8Entry[]>('/form8'),
			form9: this.http.get<Form9Entry[]>('/form9'),
		}).subscribe({
			next: ({ form8, form9 }) => {
				const has8 = Array.isArray(form8) && form8.length;
				const has9 = Array.isArray(form9) && form9.length;

				this.form8Data = (has8 ? form8 : MOCK_FORM8_DATA).map((entry) => ({
					...entry,
					formType: 'form8',
					isModified: false,
				}));

				this.form9Data = (has9 ? form9 : MOCK_FORM9_DATA).map((entry) => ({
					...entry,
					formType: 'form9',
					isModified: false,
				}));

				if (!has8 || !has9) {
					this.showToast('danger', 'Backend data incomplete — showing mock KPIs.');
				}

				this.loading = false;
			},
			error: (err) => {
				console.error('Failed to load OTN data:', err);
				this.form8Data = [...MOCK_FORM8_DATA];
				this.form9Data = [...MOCK_FORM9_DATA];
				this.loading = false;
				this.error = null;
				this.showToast('danger', 'Backend unreachable — mock data in use.');
			},
		});
	}

	private updateDropdown2Options(region: string): void {
		if (!region) {
			this.dropdown2Options = [];
			return;
		}

		this.dropdown2Options = Array.from(
			new Set(
				this.regionTable
					.filter((row) => row.region === region)
					.map((row) => row.province)
					.filter(Boolean) as string[]
			)
		);
	}

	private updateDropdown3Options(province: string): void {
		if (!province || !this.formValues.dropdown1) {
			this.dropdown3Options = [];
			return;
		}

		this.dropdown3Options = Array.from(
			new Set(
				this.regionTable
					.filter(
						(row) => row.region === this.formValues.dropdown1 && row.province === province
					)
					.map((row) => row.networkEngineer)
					.filter(Boolean) as string[]
			)
		);
	}

	private updateDropdown4Options(engineer: string): void {
		if (!engineer || !this.formValues.dropdown1 || !this.formValues.dropdown2) {
			this.dropdown4Options = [];
			return;
		}

		const leas = this.regionTable
			.filter(
				(row) =>
					row.region === this.formValues.dropdown1 &&
					row.province === this.formValues.dropdown2 &&
					row.networkEngineer === engineer
			)
			.map((row) => {
				const normalized = this.norm(row.lea);
				return this.friendlyToDbKey[normalized] || normalized;
			})
			.filter(Boolean);

		this.dropdown4Options = Array.from(new Set(leas));
	}

	private initializeFilters(): void {
		if (this.filtersInitialized) return;
		if (!this.regions.length) return;

		const firstRegion = this.regions[0];
		this.formValues.dropdown1 = firstRegion;
		this.updateDropdown2Options(firstRegion);

		const firstProvince = this.dropdown2Options[0];
		if (!firstProvince) {
			this.filtersInitialized = true;
			return;
		}

		this.formValues.dropdown2 = firstProvince;
		this.updateDropdown3Options(firstProvince);

		const firstEngineer = this.dropdown3Options[0];
		if (!firstEngineer) {
			this.filtersInitialized = true;
			return;
		}

		this.formValues.dropdown3 = firstEngineer;
		this.updateDropdown4Options(firstEngineer);

		const firstArea = this.dropdown4Options[0];
		if (firstArea) {
			this.formValues.dropdown4 = firstArea;
		}

		this.filtersInitialized = true;
	}

	onDropdownChange(
		name: 'dropdown1' | 'dropdown2' | 'dropdown3' | 'dropdown4',
		value: string
	): void {
		if (name === 'dropdown1') {
			this.formValues.dropdown1 = value;
			this.formValues.dropdown2 = '';
			this.formValues.dropdown3 = '';
			this.formValues.dropdown4 = '';
			this.updateDropdown2Options(value);
			this.dropdown3Options = [];
			this.dropdown4Options = [];
			this.cancelEdit();
			return;
		}

		if (name === 'dropdown2') {
			this.formValues.dropdown2 = value;
			this.formValues.dropdown3 = '';
			this.formValues.dropdown4 = '';
			this.updateDropdown3Options(value);
			this.dropdown4Options = [];
			this.cancelEdit();
			return;
		}

		if (name === 'dropdown3') {
			this.formValues.dropdown3 = value;
			this.formValues.dropdown4 = '';
			this.updateDropdown4Options(value);
			this.cancelEdit();
			return;
		}

		this.formValues.dropdown4 = value;
		this.cancelEdit();
	}

	calculatePercentageForm8(totalMinutes: any, unavailableMinutes: any, totalNodes: any): number {
		const tm = Number(totalMinutes) || 0;
		const um = Number(unavailableMinutes) || 0;
		const tn = Number(totalNodes) || 0;

		const totalAvailableMinutes = tm - um;
		const totalMin = 24 * 60 * this.daysInMonth * tn;
		if (totalMin <= 0) {
			return 100;
		}

		const pct = (100 * totalAvailableMinutes) / totalMin;
		return Math.max(0, Math.min(100, pct));
	}

	calculatePercentageForm9(totalFailed: any, slaNotViolated: any): number {
		const failed = Number(totalFailed) || 0;
		const ok = Number(slaNotViolated) || 0;
		if (failed === 0) {
			return 100;
		}
		const pct = (100 * ok) / failed;
		return Math.max(0, Math.min(100, pct));
	}

	startEdit(
		entry: Form8Entry | Form9Entry,
		parentKey:
			| 'total_minutes'
			| 'unavailable_minutes'
			| 'total_nodes'
			| 'Total_Failed_Links'
			| 'Links_SLA_Not_Violated'
	): void {
		if (!this.isEditingAllowed || !this.selectedKey) {
			return;
		}

		const value = (entry as any)[parentKey]?.[this.selectedKey] ?? '';
		this.editCell = {
			rowId: entry._id,
			parentKey,
			childKey: this.selectedKey,
			value: value === undefined || value === null ? '' : String(value),
		};
	}

	onEditInput(value: string): void {
		this.editCell = { ...this.editCell, value };
	}

	doneEdit(): void {
		if (!this.editCell.rowId || !this.editCell.parentKey || !this.editCell.childKey) {
			return;
		}

		const { rowId, parentKey, childKey, value } = this.editCell;

		this.form8Data = this.form8Data.map((entry) => {
			if (entry._id !== rowId) {
				return entry;
			}

			const parent = { ...(entry as any)[parentKey] };
			parent[childKey] = value;

			const next: Form8Entry = {
				...entry,
				[parentKey]: parent,
				isModified: true,
			} as Form8Entry;

			if (parentKey === 'total_nodes') {
				const nodes = Number(value) || 0;
				const computed = 24 * 60 * this.daysInMonth * nodes;
				next.total_minutes = {
					...(entry.total_minutes || {}),
					[childKey]: computed,
				};
			}
			return next;
		});

		this.form9Data = this.form9Data.map((entry) => {
			if (entry._id !== rowId) {
				return entry;
			}

			const parent = { ...(entry as any)[parentKey] };
			parent[childKey] = value;

			return {
				...entry,
				[parentKey]: parent,
				isModified: true,
			} as Form9Entry;
		});

		this.cancelEdit();
	}

	cancelEdit(): void {
		this.editCell = {
			rowId: null,
			parentKey: null,
			childKey: null,
			value: '',
		};
	}

	async saveAllChanges(): Promise<void> {
		if (!this.isEditingAllowed) {
			return;
		}

		const updates: Promise<any>[] = [];

		this.form8Data.forEach((entry) => {
			if (entry.isModified) {
				updates.push(firstValueFrom(this.http.put(`/form8/update/${entry._id}`, entry)));
			}
		});

		this.form9Data.forEach((entry) => {
			if (entry.isModified) {
				updates.push(firstValueFrom(this.http.put(`/form9/update/${entry._id}`, entry)));
			}
		});

		if (!updates.length) {
			this.showToast('success', 'No pending changes to save.');
			return;
		}

		try {
			await Promise.all(updates);
			this.loadData();
			this.showToast('success', 'OTN KPIs saved successfully.');
		} catch (error) {
			console.error('Failed to save OTN data:', error);
			this.showToast('danger', 'Failed to save changes. Please try again.');
		}
	}

	async exportToExcel(): Promise<void> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('OTN KPI');

		worksheet.addRow(['KPI (Fiber Failures Restoration & Network Availability)']);
		worksheet.addRow([`Generated Date: ${new Date().toISOString().split('T')[0]}`]);
		worksheet.addRow([]);

		const areaSet = new Set<string>();
		this.form8Data.forEach((entry) => {
			Object.keys(entry.total_minutes || {}).forEach((key) => key && areaSet.add(key));
			Object.keys(entry.unavailable_minutes || {}).forEach((key) => key && areaSet.add(key));
			Object.keys(entry.total_nodes || {}).forEach((key) => key && areaSet.add(key));
		});
		this.form9Data.forEach((entry) => {
			Object.keys(entry.Total_Failed_Links || {}).forEach((key) => key && areaSet.add(key));
			Object.keys(entry.Links_SLA_Not_Violated || {}).forEach((key) => key && areaSet.add(key));
		});

		const areas = Array.from(areaSet);

		const headers = [
			'No',
			'Network Engineer KPI',
			'Division',
			'Section',
			'KPI Percent',
			...areas.map((area) => this.optionMapping[area] || area),
		];

		const headerRow = worksheet.addRow(headers);
		headerRow.eachCell((cell: ExcelJS.Cell) => {
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
			cell.font = { bold: true, color: { argb: 'FFFFFF' } };
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});

		this.combinedData.forEach((entry) => {
			const baseRow: any[] = [
				entry.no,
				entry.network_engineer_kpi,
				entry.division,
				entry.section,
				entry.kpi_percent,
			];

			areas.forEach((area) => {
				if (entry.formType === 'form8') {
					const pct = this.calculatePercentageForm8(
						entry.total_minutes?.[area],
						entry.unavailable_minutes?.[area],
						entry.total_nodes?.[area]
					);
					baseRow.push(isNaN(pct) ? '' : `${pct.toFixed(2)}%`);
				} else {
					const pct = this.calculatePercentageForm9(
						(entry as Form9Entry).Total_Failed_Links?.[area],
						(entry as Form9Entry).Links_SLA_Not_Violated?.[area]
					);
					baseRow.push(isNaN(pct) ? '' : `${pct.toFixed(2)}%`);
				}
			});

			const bodyRow = worksheet.addRow(baseRow);
			bodyRow.eachCell((cell: ExcelJS.Cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' };
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				};
			});

			if (entry.formType === 'form8') {
				const totalMinutesRow: any[] = ['', 'Total Minutes', '', '', ''];
				const unavailableRow: any[] = ['', 'Unavailable Minutes', '', '', ''];
				const totalNodesRow: any[] = ['', 'Total Nodes', '', '', ''];

				areas.forEach((area) => {
					const nodes = Number(entry.total_nodes?.[area]) || 0;
					const manual = Number(entry.total_minutes?.[area]) || 0;
					const computed = 24 * 60 * this.daysInMonth * nodes;
					totalMinutesRow.push(manual || computed || '');
					unavailableRow.push(entry.unavailable_minutes?.[area] ?? '');
					totalNodesRow.push(entry.total_nodes?.[area] ?? '');
				});

				[totalMinutesRow, unavailableRow, totalNodesRow].forEach((rowData) => {
					const row = worksheet.addRow(rowData);
					row.eachCell((cell: ExcelJS.Cell) => {
						cell.alignment = { vertical: 'middle', horizontal: 'center' };
						cell.border = {
							top: { style: 'thin' },
							left: { style: 'thin' },
							bottom: { style: 'thin' },
							right: { style: 'thin' },
						};
					});
				});
			} else {
				const totalFailedRow: any[] = ['', 'Total Failed Links', '', '', ''];
				const slaRow: any[] = ['', 'Links SLA Not Violated', '', '', ''];

				areas.forEach((area) => {
					totalFailedRow.push((entry as Form9Entry).Total_Failed_Links?.[area] ?? '');
					slaRow.push((entry as Form9Entry).Links_SLA_Not_Violated?.[area] ?? '');
				});

				[totalFailedRow, slaRow].forEach((rowData) => {
					const row = worksheet.addRow(rowData);
					row.eachCell((cell: ExcelJS.Cell) => {
						cell.alignment = { vertical: 'middle', horizontal: 'center' };
						cell.border = {
							top: { style: 'thin' },
							left: { style: 'thin' },
							bottom: { style: 'thin' },
							right: { style: 'thin' },
						};
					});
				});
			}
		});

		worksheet.columns.forEach((col) => {
			if (col) {
				col.width = 18;
			}
		});

		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `OTN_KPI_${new Date().toISOString().split('T')[0]}.xlsx`;
		link.click();
		URL.revokeObjectURL(link.href);
	}
}
