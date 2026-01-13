import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BbAnwService, Form7Record } from '../../../../services/bb-anw.service';

@Component({
  selector: 'app-bb-anw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bb-anw.component.html',
  styleUrls: ['./bb-anw.component.scss']
})
export class BbAnwComponent implements OnInit {

  pageTitle = 'BB & ANW – Form 7';
  data: Form7Record[] = [];

  loading = false;
  saving = false;
  error = '';
  showForm = false;

  editingId: string | null = null;

  form: Form7Record = this.emptyForm();

  constructor(private service: BbAnwService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private emptyForm(): Form7Record {
    return {
      no: 0,
      networkEngineerKpi: '',
      division: '',
      section: '',
      kpiPercent: 0,
      unavailableMinutes: 0,
      totalMinutes: 0,
      totalNodes: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };
  }

  loadData(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: res => this.data = res,
      error: () => this.error = 'Failed to load data',
      complete: () => this.loading = false
    });
  }

  submitForm(): void {
    this.saving = true;

    const request$ = this.editingId
      ? this.service.update(this.editingId, this.form)
      : this.service.add(this.form);

    request$.subscribe({
      next: () => {
        this.cancelEdit();
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

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  editRow(row: Form7Record): void {
    this.editingId = row.id!;
    this.form = { ...row };
    this.showForm = true;
  }

  deleteRow(id?: string): void {
    if (!id || !confirm('Delete this record?')) return;

    this.saving = true;
    this.service.delete(id).subscribe({
      next: () => this.loadData(),
      error: () => this.error = 'Delete failed',
      complete: () => this.saving = false
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = false;
  }

  trackRow(_: number, row: Form7Record): string {
    return row.id!;
  }
}