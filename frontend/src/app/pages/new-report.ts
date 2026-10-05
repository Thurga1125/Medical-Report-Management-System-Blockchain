import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/auth.interceptor';
import { Patient, ReportValue } from '../core/models';

@Component({
  selector: 'app-new-report',
  imports: [FormsModule],
  template: `
    <h1 class="page-title">Add Report</h1>
    <p class="page-sub">Choose a patient, the report type and the result values. The report is fingerprinted on the blockchain when saved.</p>
    @if (error()) { <div class="error-message">{{ error() }}</div> }
    @if (success()) { <div class="success-message">{{ success() }}</div> }

    <div class="card">
      <form (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="form-group"><label>Patient *</label>
            <select name="patient" [(ngModel)]="patientId" required>
              <option [ngValue]="null" disabled>Select patient</option>
              @for (p of patients(); track p.id) { <option [ngValue]="p.id">{{ p.name }} (#{{ p.id }})</option> }
            </select></div>
          <div class="form-group"><label>Report type *</label>
            <input name="type" list="types" [(ngModel)]="reportType" required placeholder="e.g. Blood Test" />
            <datalist id="types"><option value="Blood Test"></option><option value="Urine Test"></option><option value="X-Ray"></option><option value="MRI"></option><option value="Lipid Profile"></option></datalist></div>
          <div class="form-group"><label>Report date</label><input name="date" type="date" [(ngModel)]="date" /></div>
        </div>

        <h3 style="margin:1.5rem 0 .8rem">Values</h3>
        @for (v of values; track $index) {
          <div class="form-grid" style="margin-bottom:.8rem;align-items:end">
            <div class="form-group"><label>Parameter</label><input [name]="'n' + $index" [(ngModel)]="v.name" required placeholder="Hemoglobin" /></div>
            <div class="form-group"><label>Value</label><input [name]="'v' + $index" [(ngModel)]="v.value" required placeholder="13.5" /></div>
            <div class="form-group"><label>Unit</label><input [name]="'u' + $index" [(ngModel)]="v.unit" placeholder="g/dL" /></div>
            <div class="form-group"><label>Reference range</label><input [name]="'r' + $index" [(ngModel)]="v.referenceRange" placeholder="13 - 17" /></div>
            <div><button class="btn-danger btn-sm" type="button" (click)="removeValue($index)" [disabled]="values.length === 1">Remove</button></div>
          </div>
        }
        <button class="btn-ghost" type="button" (click)="addValue()">+ Add value</button>

        <div style="margin-top:1.5rem">
          <button class="btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving to blockchain…' : 'Save Report' }}</button>
        </div>
      </form>
    </div>
  `,
})
export class NewReport {
  private api = inject(ApiService);
  patients = signal<Patient[]>([]);
  error = signal('');
  success = signal('');
  saving = signal(false);
  patientId: number | null = null;
  reportType = '';
  date = '';
  values: ReportValue[] = [{ name: '', value: '' }];

  constructor() { this.api.patients().subscribe((p) => this.patients.set(p)); }

  addValue() { this.values.push({ name: '', value: '' }); }
  removeValue(i: number) { this.values.splice(i, 1); }

  submit() {
    this.error.set(''); this.success.set('');
    if (!this.patientId) { this.error.set('Please select a patient.'); return; }
    this.saving.set(true);
    this.api.addReport({ patientId: this.patientId, reportType: this.reportType, reportDate: this.date || null, values: this.values }).subscribe({
      next: (r) => {
        this.saving.set(false);
        this.success.set(`Report saved and anchored in block #${r.blockNumber} (tx ${r.txHash.slice(0, 14)}…).`);
        this.values = [{ name: '', value: '' }];
        this.patientId = null; this.reportType = ''; this.date = '';
      },
      error: (e) => { this.saving.set(false); this.error.set(errorMessage(e)); },
    });
  }
}
