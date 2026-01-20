import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Form8Service } from '../../../../services/form8.service';
import { KpiService, KpiRecord } from '../../../../services/kpi.service';
import { RegionService, Region } from '../../../../services/region.service';

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
	adminForm8Rows: any[] = [];
	adminForm9Rows: KpiRecord[] = [];

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

	constructor(
		private http: HttpClient,
		private form8Service: Form8Service,
		private kpiService: KpiService,
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

	get selectedLeaLabel(): string {
		if (!this.formValues.dropdown4) {
			return '';
		}
		const key = this.formValues.dropdown4;
		return this.optionMapping[key] || key.toUpperCase();
	}

	get hasSnapshotData(): boolean {
		if (!this.selectedKey) {
			return false;
		}

		return (
			this.form8Data.some((entry) => this.hasForm8Snapshot(entry, this.selectedKey)) ||
			this.form9Data.some((entry) => this.hasForm9Snapshot(entry, this.selectedKey))
		);
	}

	get form8SnapshotRows(): Form8Entry[] {
		if (!this.selectedKey) {
			return [];
		}
		return this.form8Data.filter((entry) => this.hasForm8Snapshot(entry, this.selectedKey));
	}

	get form9SnapshotRows(): Form9Entry[] {
		if (!this.selectedKey) {
			return [];
		}
		return this.form9Data.filter((entry) => this.hasForm9Snapshot(entry, this.selectedKey));
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
		this.regionService.getAll().subscribe({
			next: (res: Region[] | any[]) => {
				const source = Array.isArray(res) ? res : [];
				const mapped: RegionRow[] = source.map((item: any) => ({
					region: item.region ?? item.Region ?? '',
					province: item.province ?? item.Province ?? '',
					networkEngineer: item.networkEngineer ?? item.networkengineer ?? item.NetworkEngineer ?? '',
					lea: item.lea ?? item.leacode ?? item.leaCode ?? item.LEA ?? ''
				}));
				this.regionTable = mapped.length ? mapped : [...LOCAL_REGION_TABLE];
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
			form8: this.form8Service.getAll(),
			form9: this.kpiService.getAll(),
		}).subscribe({
			next: ({ form8, form9 }) => {
				try {
					this.adminForm8Rows = Array.isArray(form8) ? form8 : [];
					this.adminForm9Rows = Array.isArray(form9) ? form9 : [];
					this.form8Data = this.transformForm8Records(this.adminForm8Rows);
					this.form9Data = this.transformForm9Records(this.adminForm9Rows);
					this.loading = false;
				} catch (mappingError) {
					console.error('Failed to transform OTN KPI payloads:', mappingError);
					this.form8Data = [];
					this.form9Data = [];
					this.loading = false;
					this.error = 'Failed to prepare OTN KPI data.';
				}
			},
			error: (err) => {
				console.error('Failed to load OTN admin data:', err);
				this.adminForm8Rows = [];
				this.adminForm9Rows = [];
				this.form8Data = [];
				this.form9Data = [];
				this.loading = false;
				this.error = 'Failed to load OTN KPI data.';
			},
		});
	}

	private transformForm8Records(records: any[]): Form8Entry[] {
		return (Array.isArray(records) ? records : [])
			.map((record, index) => this.mapForm8Record(record, index))
			.filter((entry): entry is Form8Entry => Boolean(entry))
			.sort((a, b) => a.no - b.no);
	}

	private transformForm9Records(records: any[]): Form9Entry[] {
		return (Array.isArray(records) ? records : [])
			.map((record, index) => this.mapForm9Record(record, index))
			.filter((entry): entry is Form9Entry => Boolean(entry))
			.sort((a, b) => a.no - b.no);
	}

	private mapForm8Record(record: any, index: number): Form8Entry {
		const entry: Form8Entry = {
			_id: this.extractId(record, index, 'form8'),
			no: this.toNumber(this.pickFirst(record, ['no', 'No', 'NO']), index + 1),
			network_engineer_kpi: this.toStringValue(
				this.pickFirst(
					record,
					['network_engineer_kpi', 'network_Engineer_Kpi', 'networkEngineerKpi', 'NetworkEngineerKpi']
				),
				'—'
			),
			division: this.toStringValue(this.pickFirst(record, ['division', 'Division']), '—'),
			section: this.toStringValue(this.pickFirst(record, ['section', 'Section']), '—'),
			kpi_percent: this.toNumber(
				this.pickFirst(record, ['kpi_percent', 'kpi_Percent', 'Kpi_Percent', 'kpiPercent', 'KpiPercent']),
				0
			),
			formType: 'form8',
			total_minutes: this.collectDict(record, 'total_minutes'),
			unavailable_minutes: this.collectDict(record, 'unavailable_minutes'),
			total_nodes: this.collectDict(record, 'total_nodes'),
		};
		return entry;
	}

	private mapForm9Record(record: any, index: number): Form9Entry {
		const entry: Form9Entry = {
			_id: this.extractId(record, index, 'form9'),
			no: this.toNumber(this.pickFirst(record, ['no', 'No', 'NO']), index + 1),
			network_engineer_kpi: this.toStringValue(
				this.pickFirst(
					record,
					['network_engineer_kpi', 'network_Engineer_Kpi', 'networkEngineerKpi', 'NetworkEngineerKpi']
				),
				'—'
			),
			division: this.toStringValue(this.pickFirst(record, ['division', 'Division']), '—'),
			section: this.toStringValue(this.pickFirst(record, ['section', 'Section']), '—'),
			kpi_percent: this.toNumber(
				this.pickFirst(record, ['kpi_percent', 'kpi_Percent', 'Kpi_Percent', 'kpiPercent', 'KpiPercent']),
				0
			),
			formType: 'form9',
			Total_Failed_Links: this.collectDict(record, 'total_failed_links'),
			Links_SLA_Not_Violated: this.collectDict(record, 'links_sla_not_violated'),
		};
		return entry;
	}

	private pickFirst(record: any, keys: string[], fallback: any = undefined): any {
		if (!record) {
			return fallback;
		}
		for (const key of keys) {
			if (record[key] !== undefined && record[key] !== null) {
				return record[key];
			}
		}
		return fallback;
	}

	private extractId(record: any, index: number, prefix: string): string {
		const rawId = this.pickFirst(record, ['_id', 'id', 'Id', 'ID', 'recordId']);
		if (rawId !== undefined && rawId !== null && rawId !== '') {
			return String(rawId);
		}
		return `${prefix}-${index + 1}`;
	}

	private toNumber(value: any, fallback = 0): number {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	private toStringValue(value: any, fallback = ''): string {
		if (value === undefined || value === null || value === '') {
			return fallback;
		}
		return String(value);
	}

	private collectDict(record: any, baseKey: string): Dict<any> {
		if (!record) {
			return {};
		}
		const containers = [null, 'metrics', 'snapshot', 'payload', 'data', 'values', 'details'];
		const variants = this.buildKeyVariants(baseKey);
		for (const container of containers) {
			const rawContainer = container ? record?.[container] : record;
			const containerValue = this.parseContainer(rawContainer);
			if (!containerValue || typeof containerValue !== 'object') {
				continue;
			}
			for (const variant of variants) {
				if (Object.prototype.hasOwnProperty.call(containerValue, variant)) {
					const normalized = this.normalizeDict((containerValue as any)[variant]);
					if (Object.keys(normalized).length) {
						return normalized;
					}
				}
			}
		}
		return {};
	}

	private buildKeyVariants(baseKey: string): string[] {
		const cleaned = baseKey.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
		const camel = baseKey.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
		const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
		const snakePascal = baseKey.replace(/(^|_)([a-z])/g, (_, sep: string, char: string) => `${sep}${char.toUpperCase()}`);
		return Array.from(
			new Set([
				baseKey,
				baseKey.toLowerCase(),
				baseKey.toUpperCase(),
				snakePascal,
				camel,
				camel.toLowerCase(),
				pascal,
				pascal.toLowerCase(),
				cleaned,
				`${camel}Json`,
				`${pascal}Json`,
				`${snakePascal}Json`,
				`${baseKey}_json`,
				`${cleaned}Json`,
			])
		);
	}

	private parseContainer(value: any): any {
		if (value === undefined || value === null) {
			return null;
		}
		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
				try {
					return JSON.parse(trimmed);
				} catch (err) {
					console.warn('Failed to parse KPI snapshot container:', err);
					return null;
				}
			}
			return null;
		}
		return value;
	}

	private normalizeDict(value: any): Dict<any> {
		if (value === undefined || value === null || value === '') {
			return {};
		}
		let source = value;
		if (typeof source === 'string') {
			const trimmed = source.trim();
			if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
				try {
					source = JSON.parse(trimmed);
				} catch (err) {
					console.warn('Failed to parse KPI snapshot payload:', err);
					return {};
				}
			} else {
				return {};
			}
		}
		if (Array.isArray(source)) {
			return source.reduce((acc: Dict<any>, item: any) => {
				if (!item || typeof item !== 'object') {
					return acc;
				}
				const keyCandidate = item.key ?? item.area ?? item.label ?? item.name ?? item.code ?? item.id ?? '';
				const normalizedKey = this.norm(keyCandidate);
				if (!normalizedKey) {
					return acc;
				}
				const valueCandidate =
					item.value ??
					item.minutes ??
					item.total ??
					item.count ??
					item.amount ??
					item.metric ??
					item.data;
				if (valueCandidate !== undefined && valueCandidate !== null && valueCandidate !== '') {
					acc[normalizedKey] = valueCandidate;
				}
				return acc;
			}, {} as Dict<any>);
		}
		if (typeof source === 'object') {
			return Object.keys(source).reduce((acc: Dict<any>, key: string) => {
				const normalizedKey = this.norm(key);
				if (!normalizedKey) {
					return acc;
				}
				const metricValue = (source as any)[key];
				if (metricValue === undefined || metricValue === null || metricValue === '') {
					return acc;
				}
				acc[normalizedKey] = metricValue;
				return acc;
			}, {} as Dict<any>);
		}
		return {};
	}

	hasForm8Snapshot(entry: Form8Entry, key?: string): boolean {
		const lookup = this.norm(key || this.selectedKey);
		if (!lookup) {
			return false;
		}
		return Boolean(
			(entry.total_minutes && entry.total_minutes[lookup] !== undefined) ||
			(entry.unavailable_minutes && entry.unavailable_minutes[lookup] !== undefined) ||
			(entry.total_nodes && entry.total_nodes[lookup] !== undefined)
		);
	}

	hasForm9Snapshot(entry: Form9Entry, key?: string): boolean {
		const lookup = this.norm(key || this.selectedKey);
		if (!lookup) {
			return false;
		}
		return Boolean(
			(entry.Total_Failed_Links && entry.Total_Failed_Links[lookup] !== undefined) ||
			(entry.Links_SLA_Not_Violated && entry.Links_SLA_Not_Violated[lookup] !== undefined)
		);
	}

	formatSnapshotValue(value: any): string {
		if (value === undefined || value === null || value === '') {
			return '—';
		}
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(2);
		}
		return String(value);
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
		
		// Don't auto-select, leave all as empty strings
		this.formValues.dropdown1 = '';
		this.formValues.dropdown2 = '';
		this.formValues.dropdown3 = '';
		this.formValues.dropdown4 = '';
		
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
