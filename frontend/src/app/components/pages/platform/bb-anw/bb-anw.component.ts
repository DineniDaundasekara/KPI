import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegionService, Region } from '../../../../services/region.service';
import * as ExcelJS from 'exceljs';
import { firstValueFrom } from 'rxjs';

type Dict<T = any> = Record<string, T>;

interface RegionRow {
	region?: string;
	province?: string;
	networkEngineer?: string;
	lea?: string;
}

interface Form7Entry {
	_id: string;
	no: number;
	network_engineer_kpi: string;
	division: string;
	section: string;
	kpi_percent: number;
	total_minutes?: Dict<any>;
	unavailable_minutes?: Dict<any>;
	total_nodes?: Dict<any>;
}

interface EditCellState {
	rowId: string | null;
	key: string | null;
	value: string;
}

const MOCK_FORM7_DATA: Form7Entry[] = [
	{
		_id: '66fcb5bcf02a02990517533a',
		no: 8,
		network_engineer_kpi: 'Tellabs NW Availability',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.99,
		unavailable_minutes: {
			cenhkmd: '10',
			cenhkmd1: '20',
			gqkintb: '15',
			ndfrm: '8',
			awho: '12',
			konix: '5',
			ngivt: '7',
			kgkly: '6',
			cwpx: '14',
			debkymt: '9',
			gphtnw: '11',
			adipr: '4',
			bddwmrg: '7',
			keirn: '3',
			embmbmh: '8',
			aggl: '13',
			hrktph: '6',
			bcjrdkltc: '9',
			ja: '2',
			komltmbva: '1',
		},
		total_minutes: {
			cenhkmd: '15000',
			cenhkmd1: '200',
			gqkintb: '357120',
			ndfrm: '80',
			awho: '120',
			konix: '50',
			ngivt: '70',
			kgkly: '60',
			cwpx: '140',
			debkymt: '90',
			gphtnw: '110',
			adipr: '40',
			bddwmrg: '70',
			keirn: '30',
			embmbmh: '80',
			aggl: '130',
			hrktph: '26784000',
			bcjrdkltc: '90',
			ja: '20',
			komltmbva: '10',
		},
		total_nodes: {
			cenhkmd: '3',
			cenhkmd1: '6',
			gqkintb: '8',
			ndfrm: '8',
			awho: '9',
			konix: '4',
			ngivt: '6',
			kgkly: '5',
			cwpx: '7',
			debkymt: '6',
			gphtnw: '8',
			adipr: '3',
			bddwmrg: '4',
			keirn: '3',
			embmbmh: '5',
			aggl: '7',
			hrktph: '600',
			bcjrdkltc: '5',
			ja: '2',
			komltmbva: '1',
		},
	},
	{
		_id: '66fcb5f9f02a02990517533f',
		no: 9,
		network_engineer_kpi: 'MEN NW availability',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.99,
		unavailable_minutes: {
			cenhkmd: '15',
			cenhkmd1: '20',
			gqkintb: '10',
			ndfrm: '8',
			awho: '12',
			konix: '5',
			ngivt: '7',
			kgkly: '6',
			cwpx: '14',
			debkymt: '9',
			gphtnw: '11',
			adipr: '4',
			bddwmrg: '7',
			keirn: '3',
			embmbmh: '8',
			aggl: '13',
			hrktph: '10',
			bcjrdkltc: '9',
			ja: '2',
			komltmbva: '1',
		},
		total_minutes: {
			cenhkmd: '150',
			cenhkmd1: '200',
			gqkintb: '100',
			ndfrm: '80',
			awho: '120',
			konix: '50',
			ngivt: '70',
			kgkly: '44640',
			cwpx: '140',
			debkymt: '90',
			gphtnw: '133920',
			adipr: '40',
			bddwmrg: '70',
			keirn: '30',
			embmbmh: '80',
			aggl: '130',
			hrktph: '133920',
			bcjrdkltc: '90',
			ja: '20',
			komltmbva: '133920',
		},
		total_nodes: {
			cenhkmd: '5',
			cenhkmd1: '6',
			gqkintb: '7',
			ndfrm: '8',
			awho: '9',
			konix: '4',
			ngivt: '6',
			kgkly: '1',
			cwpx: '7',
			debkymt: '6',
			gphtnw: '3',
			adipr: '3',
			bddwmrg: '4',
			keirn: '3',
			embmbmh: '5',
			aggl: '7',
			hrktph: '3',
			bcjrdkltc: '5',
			ja: '2',
			komltmbva: '3',
		},
	},
	{
		_id: '66fcb623f02a029905175344',
		no: 10,
		network_engineer_kpi: 'MSAN availability (Except power)',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.99,
		unavailable_minutes: {
			cenhkmd: '15',
			cenhkmd1: '20',
			gqkintb: '10',
			ndfrm: '8',
			awho: '12',
			konix: '5',
			ngivt: '7',
			kgkly: '6',
			cwpx: '14',
			debkymt: '9',
			gphtnw: '11',
			adipr: '4',
			bddwmrg: '7',
			keirn: '3',
			embmbmh: '8',
			aggl: '13',
			hrktph: '6',
			bcjrdkltc: '9',
			ja: '2',
			komltmbva: '1',
		},
		total_minutes: {
			cenhkmd: '150',
			cenhkmd1: '200',
			gqkintb: '10',
			ndfrm: '80',
			awho: '120',
			konix: '50',
			ngivt: '70',
			kgkly: '133920',
			cwpx: '140',
			debkymt: '90',
			gphtnw: '44640',
			adipr: '40',
			bddwmrg: '70',
			keirn: '30',
			embmbmh: '80',
			aggl: '130',
			hrktph: '44640',
			bcjrdkltc: '90',
			ja: '20',
			komltmbva: '89280',
		},
		total_nodes: {
			cenhkmd: '5',
			cenhkmd1: '6',
			gqkintb: '7',
			ndfrm: '8',
			awho: '9',
			konix: '4',
			ngivt: '6',
			kgkly: '3',
			cwpx: '7',
			debkymt: '6',
			gphtnw: '1',
			adipr: '3',
			bddwmrg: '4',
			keirn: '3',
			embmbmh: '5',
			aggl: '7',
			hrktph: '1',
			bcjrdkltc: '5',
			ja: '2',
			komltmbva: '2',
		},
	},
	{
		_id: '66fcb649f02a029905175349',
		no: 11,
		network_engineer_kpi: 'MSAN availability (With power)',
		division: 'TRANSPORT & ACCESS',
		section: 'BB&ANW',
		kpi_percent: 99.94,
		unavailable_minutes: {
			cenhkmd: '15',
			cenhkmd1: '20',
			gqkintb: '10',
			ndfrm: '8',
			awho: '12',
			konix: '5',
			ngivt: '7',
			kgkly: '6',
			cwpx: '14',
			debkymt: '9',
			gphtnw: '11',
			adipr: '4',
			bddwmrg: '7',
			keirn: '3',
			embmbmh: '8',
			aggl: '13',
			hrktph: '6',
			bcjrdkltc: '9',
			ja: '2',
			komltmbva: '1',
		},
		total_minutes: {
			cenhkmd: '150',
			cenhkmd1: '200',
			gqkintb: '267840',
			ndfrm: '80',
			awho: '120',
			konix: '50',
			ngivt: '70',
			kgkly: '312480',
			cwpx: '140',
			debkymt: '90',
			gphtnw: '312480',
			adipr: '40',
			bddwmrg: '70',
			keirn: '30',
			embmbmh: '80',
			aggl: '223200',
			hrktph: '60',
			bcjrdkltc: '90',
			ja: '20',
			komltmbva: '89280',
		},
		total_nodes: {
			cenhkmd: '5',
			cenhkmd1: '6',
			gqkintb: '6',
			ndfrm: '8',
			awho: '9',
			konix: '4',
			ngivt: '6',
			kgkly: '7',
			cwpx: '7',
			debkymt: '6',
			gphtnw: '7',
			adipr: '3',
			bddwmrg: '4',
			keirn: '3',
			embmbmh: '5',
			aggl: '5',
			hrktph: '6',
			bcjrdkltc: '5',
			ja: '2',
			komltmbva: '2',
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
	selector: 'app-bb-anw',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './bb-anw.component.html',
	styleUrls: ['./bb-anw.component.scss'],
})
export class BbAnwComponent implements OnInit, OnDestroy {
	pageTitle = 'Platform KPI — BB & ANW';

	data: Form7Entry[] = [...MOCK_FORM7_DATA];
	regionTable: RegionRow[] = [...LOCAL_REGION_TABLE];

	loading = true;
	error: string | null = null;

	role: string | null = null;
	isEditingAllowed = false;

	private permissionTimer: ReturnType<typeof setInterval> | null = null;

	readonly daysInMonth: number = new Date(
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		0
	).getDate();

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
		key: null,
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

	constructor(
		private http: HttpClient,
		private regionService: RegionService
	) {}

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
		setTimeout(() => this.dismissToast(id), 2800);
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
		this.regionService.getAll().subscribe({
			next: (res: Region[] | any[]) => {
				const source = Array.isArray(res) ? res : [];

				const mapped: RegionRow[] = source.map((item: any) => ({
					region: item.region ?? item.Region ?? '',
					province: item.province ?? item.Province ?? '',
					networkEngineer:
						item.networkEngineer ??
						item.networkengineer ??
						item.NetworkEngineer ??
						'',
					lea:
						item.lea ??
						item.leacode ??
						item.leaCode ??
						item.LEA ??
						'',
				}));

				this.regionTable = mapped.length ? mapped : [...LOCAL_REGION_TABLE];
				this.initializeFilters();
			},
			error: (err) => {
				console.error('Failed to fetch region table from API, using local fallback:', err);
				this.regionTable = [...LOCAL_REGION_TABLE];
				this.initializeFilters();
			},
		});
	}

	loadData(): void {
		this.loading = true;
		this.error = null;

		this.http.get<Form7Entry[]>('/form7').subscribe({
			next: (res) => {
				const rows = Array.isArray(res) && res.length ? res : [...MOCK_FORM7_DATA];
				this.data = rows.map((entry) => ({ ...entry }));
				this.loading = false;

				if (!res || !res.length) {
					this.showToast('danger', 'Backend empty — showing mock BB & ANW KPIs.');
				}
			},
			error: (err) => {
				console.error('Failed to load Form7 data:', err);
				this.data = [...MOCK_FORM7_DATA];
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

	calculatePercentage(totalMinutes: any, unavailableMinutes: any, totalNodes: any): number {
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

	startEdit(entry: Form7Entry, key: 'unavailable_minutes' | 'total_minutes' | 'total_nodes'): void {
		if (!this.isEditingAllowed || !this.selectedKey) return;

		const nestedKey = `${key}.${this.selectedKey}`;
		const value = (entry as any)[key]?.[this.selectedKey];

		this.editCell = {
			rowId: entry._id,
			key: nestedKey,
			value: value === undefined || value === null ? '' : String(value),
		};
	}

	onEditInput(value: string): void {
		this.editCell = { ...this.editCell, value };
	}

	doneEdit(): void {
		if (!this.editCell.rowId || !this.editCell.key) return;

		const [parentKey, childKey] = this.editCell.key.split('.');
		const newValue = this.editCell.value;

		this.data = this.data.map((entry) => {
			if (entry._id !== this.editCell.rowId) {
				return entry;
			}

			const next: Form7Entry = { ...entry };
			const parent = { ...(next as any)[parentKey] };
			parent[childKey] = newValue;
			(next as any)[parentKey] = parent;

			if (parentKey === 'total_nodes') {
				const nodes = Number(newValue) || 0;
				const computed = 24 * 60 * this.daysInMonth * nodes;
				next.total_minutes = {
					...(next.total_minutes || {}),
					[childKey]: computed,
				};
			}

			return next;
		});

		this.cancelEdit();
	}

	cancelEdit(): void {
		this.editCell = { rowId: null, key: null, value: '' };
	}

	async saveAllChanges(): Promise<void> {
		if (!this.isEditingAllowed) return;

		try {
			await Promise.all(
				this.data.map((entry) =>
					firstValueFrom(this.http.put(`/form7/update/${entry._id}`, entry))
				)
			);

			this.loadData();
			this.showToast('success', 'BB & ANW KPIs saved successfully.');
		} catch (error) {
			console.error('Failed to save BB & ANW data:', error);
			this.showToast('danger', 'Failed to save changes. Please try again.');
		}
	}

	async exportToExcel(): Promise<void> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('BB & ANW KPI');

		worksheet.addRow(['KPI (MSAN / OLT / IP Core - Network Availability)']);
		worksheet.addRow([`Generated Date: ${new Date().toISOString().split('T')[0]}`]);
		worksheet.addRow([]);

		const areaKeys = Object.keys(this.optionMapping);
		const headers = [
			'No',
			'Network Engineer KPI',
			'Division',
			'Section',
			'KPI Percent',
			...areaKeys.map((key) => this.optionMapping[key] || key),
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

		this.data.forEach((entry) => {
			const row: any[] = [
				entry.no,
				entry.network_engineer_kpi,
				entry.division,
				entry.section,
				entry.kpi_percent,
			];

			areaKeys.forEach((key) => {
				const pct = this.calculatePercentage(
					entry.total_minutes?.[key],
					entry.unavailable_minutes?.[key],
					entry.total_nodes?.[key]
				);
				row.push(isNaN(pct) ? '' : `${pct.toFixed(2)}%`);
			});

			const bodyRow = worksheet.addRow(row);
			bodyRow.eachCell((cell: ExcelJS.Cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'center' };
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				};
			});

			const unavailableRow = [' ', 'Unavailable Minutes', ' ', ' ', ' '];
			const totalRow = [' ', 'Total Minutes', ' ', ' ', ' '];
			const nodesRow = [' ', 'Total Nodes', ' ', ' ', ' '];

			areaKeys.forEach((key) => {
				unavailableRow.push(entry.unavailable_minutes?.[key] ?? '');
				totalRow.push(entry.total_minutes?.[key] ?? '');
				nodesRow.push(entry.total_nodes?.[key] ?? '');
			});

			[unavailableRow, totalRow, nodesRow].forEach((dataRow) => {
				const subRow = worksheet.addRow(dataRow);
				subRow.eachCell((cell: ExcelJS.Cell) => {
					cell.alignment = { vertical: 'middle', horizontal: 'center' };
					cell.border = {
						top: { style: 'thin' },
						left: { style: 'thin' },
						bottom: { style: 'thin' },
						right: { style: 'thin' },
					};
				});
			});
		});

		worksheet.columns.forEach((column) => {
			if (column) {
				column.width = 18;
			}
		});

		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `BB_ANW_KPI_${new Date().toISOString().split('T')[0]}.xlsx`;
		link.click();
		URL.revokeObjectURL(link.href);
	}
}
