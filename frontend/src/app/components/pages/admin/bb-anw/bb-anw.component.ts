import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BbAnwService, BbAnwHeaderDto } from '../../../../services/bb-anw.service';

@Component({
  selector: 'app-bb-anw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bb-anw.component.html',
  styleUrls: ['./bb-anw.component.scss']
})
export class BbAnwComponent implements OnInit {

  pageTitle = 'BB & ANW – KPI Management';
  data: BbAnwHeaderDto[] = [];

  loading = false;
  saving = false;
  error = '';

  editingId: number | null = null;
  showForm = false;

  form: BbAnwHeaderDto = this.emptyForm();

  constructor(private service: BbAnwService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private emptyForm(): BbAnwHeaderDto {
    return {
      id: undefined,
      networkEngineerKpi: '',
      division: '',
      section: '',
      kpiPercent: null
    };
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.service.getHeaders().subscribe({
      next: res => this.data = Array.isArray(res) ? res : [],
      error: () => {
        this.error = 'Failed to load data';
        this.data = [];
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  submitForm(): void {
    this.saving = true;
    this.error = '';

    const payload = this.normalizeForm();

    const request$ = this.editingId !== null
      ? this.service.updateHeader(this.editingId, payload)
      : this.service.addHeader(payload);

    request$.subscribe({
      next: () => {
        this.closeForm();
        this.loadData();
      },
      error: err => {
        console.error(err);
        this.error = 'Save failed';
        this.saving = false;
      },
      complete: () => this.saving = false
    });
  }

  editRow(row: BbAnwHeaderDto): void {
    this.showForm = true;
    this.editingId = row.id ?? null;

    this.form = {
      id: row.id,
      networkEngineerKpi: row.networkEngineerKpi,
      division: row.division ?? '',
      section: row.section ?? '',
      kpiPercent: row.kpiPercent ?? null
    };
  }

  deleteRow(id?: number): void {
    if (typeof id !== 'number' || !confirm('Delete this KPI header? (This will also delete node rows in DB)')) return;

    this.saving = true;
    this.service.delete(id).subscribe({
      next: () => this.loadData(),
      error: () => this.error = 'Delete failed',
      complete: () => this.saving = false
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  openForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  trackRow(index: number, row: BbAnwHeaderDto): string {
    return row.id !== undefined ? row.id.toString() : `row-${index}`;
  }

  private normalizeForm(): BbAnwHeaderDto {
    return {
      id: this.editingId ?? undefined,
      networkEngineerKpi: (this.form.networkEngineerKpi || '').trim(),
      division: this.form.division?.trim() || null,
      section: this.form.section?.trim() || null,
      kpiPercent: this.form.kpiPercent === null || this.form.kpiPercent === undefined
        ? null
        : Number(this.form.kpiPercent)
    };
  }
}
