import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type EmailRecipient = {
  _id: string;
  email: string;
};

const MOCK_RECIPIENTS: EmailRecipient[] = [
  { _id: '67bbffc4beb60321d347b2a3', email: 'yamunas@slt.com.lk' },
  { _id: '678f1cb1e4c2f270ea853cd0', email: 'yasithasandu@gmail.com' }
];

@Component({
  selector: 'app-email-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './email-service.component.html',
  styleUrls: ['./email-service.component.scss']
})
export class EmailServiceComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  pageTitle = 'Email Recipients Management';
  recipients: EmailRecipient[] = [...MOCK_RECIPIENTS];
  editingId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.http
      .get<EmailRecipient[]>('/api/emails/recipients')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.recipients = response?.length ? response : [...MOCK_RECIPIENTS];
        },
        error: err => {
          console.error('Failed to fetch data', err);
          this.errorMessage = 'Unable to load email recipients. Showing sample list.';
          this.recipients = [...MOCK_RECIPIENTS];
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const request$ = this.editingId
      ? this.http.put(`/api/emails/update-recipient/${this.editingId}`, payload)
      : this.http.post('/api/emails/add-recipient', payload);

    this.saving = true;
    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.fetchData();
        },
        error: err => {
          console.error('Failed to save data', err);
          this.errorMessage = 'Saving failed. Please try again.';
        }
      });
  }

  onEdit(recipient: EmailRecipient): void {
    this.editingId = recipient._id;
    this.form.patchValue({ email: recipient.email });
  }

  onDelete(id: string): void {
    if (!window.confirm('Are you sure you want to delete this recipient?')) {
      return;
    }

    this.saving = true;
    this.http
      .delete(`/api/emails/delete-recipient/${id}`)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.fetchData(),
        error: err => {
          console.error('Failed to delete data', err);
          this.errorMessage = 'Deletion failed. Please try again.';
        }
      });
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({ email: '' });
    this.editingId = null;
  }
}

