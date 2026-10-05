import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/auth.interceptor';
import { LabReport, Patient, VerifyResult } from '../core/models';
import { VerifyBadge } from '../shared/verify-badge';

/** Report list used by labs (own reports) and the hospital (all reports + fabrication check). */
@Component({
  selector: 'app-reports',
  imports: [FormsModule, VerifyBadge],
  template: `
    <h1 class="page-title">Lab Reports</h1>
    <p class="page-sub">Filter by patient or report type. Verify checks a report against the blockchain.</p>
    @if (error()) { <div class="error-message">{{ error() }}</div> }

    <div class="card toolbar">
      <div class="form-group"><label>Patient</label>
        <select [(ngModel)]="patientId" (ngModelChange)="load()">
          <option [ngValue]="null">All patients</option>
          @for (p of patients(); track p.id) { <option [ngValue]="p.id">{{ p.name }} (#{{ p.id }})</option> }
        </select></div>
      <div class="form-group"><label>Report type</label><input [(ngModel)]="type" (change)="load()" placeholder="e.g. Blood Test" /></div>
      <button class="btn-secondary" (click)="clear()">Clear</button>
      <button class="btn-primary" (click)="verifyAll()">Verify all shown</button>
    </div>

    <div class="card table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Patient</th><th>Lab</th><th>Type</th><th>Values</th><th>Blockchain</th><th>Status</th></tr></thead>
        <tbody>
          @for (r of reports(); track r.id) {
            <tr>
              <td>{{ r.reportDate }}</td>
              <td>{{ r.patient.name }}</td>
              <td>{{ r.lab.name }}</td>
              <td><b>{{ r.reportType }}</b></td>
              <td>@for (v of r.values; track $index) { <div>{{ v.name }}: <b>{{ v.value }}</b> {{ v.unit }} @if (v.referenceRange) { <span style="color:var(--muted)">(ref {{ v.referenceRange }})</span> }</div> }</td>
              <td class="mono">block #{{ r.blockNumber }}<br />{{ r.txHash.slice(0, 18) }}…</td>
              <td>
                <app-verify-badge [result]="results()[r.id]" />
                <button class="btn-ghost btn-sm" (click)="verify(r)">Verify</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="7" class="empty">No reports found.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class Reports {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  reports = signal<LabReport[]>([]);
  patients = signal<Patient[]>([]);
  results = signal<Record<string, VerifyResult>>({});
  error = signal('');
  patientId: number | null = this.route.snapshot.queryParamMap.has('patientId') ? Number(this.route.snapshot.queryParamMap.get('patientId')) : null;
  type = '';

  constructor() {
    this.api.patients().subscribe((p) => this.patients.set(p));
    this.load();
  }

  load() {
    this.api.reports(this.patientId, this.type.trim()).subscribe({
      next: (r) => { this.reports.set(r); this.results.set({}); },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  clear() { this.patientId = null; this.type = ''; this.load(); }

  verify(r: LabReport) {
    this.api.verifyReport(r.id).subscribe({
      next: (v) => this.results.update((m) => ({ ...m, [r.id]: v })),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  verifyAll() { this.reports().forEach((r) => this.verify(r)); }
}
