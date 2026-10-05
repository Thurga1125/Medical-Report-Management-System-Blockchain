import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { errorMessage } from '../core/auth.interceptor';
import { Bill, Patient, VerifyResult } from '../core/models';
import { VerifyBadge } from '../shared/verify-badge';

/** Bill list used by pharmacies (own bills) and the hospital (all bills + fabrication check). */
@Component({
  selector: 'app-bills',
  imports: [FormsModule, CurrencyPipe, VerifyBadge],
  template: `
    <h1 class="page-title">Pharmacy Bills</h1>
    <p class="page-sub">Filter by patient or date. Verify checks a bill against the blockchain.</p>
    @if (error()) { <div class="error-message">{{ error() }}</div> }

    <div class="card toolbar">
      <div class="form-group"><label>Patient</label>
        <select [(ngModel)]="patientId" (ngModelChange)="load()">
          <option [ngValue]="null">All patients</option>
          @for (p of patients(); track p.id) { <option [ngValue]="p.id">{{ p.name }} (#{{ p.id }})</option> }
        </select></div>
      <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="date" (ngModelChange)="load()" /></div>
      <button class="btn-secondary" (click)="clear()">Clear</button>
      <button class="btn-primary" (click)="verifyAll()">Verify all shown</button>
    </div>

    <div class="card table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Patient</th><th>Pharmacy</th><th>Items</th><th>Total</th><th>Blockchain</th><th>Status</th></tr></thead>
        <tbody>
          @for (b of bills(); track b.id) {
            <tr>
              <td>{{ b.billDate }}</td>
              <td>{{ b.patient.name }}</td>
              <td>{{ b.pharmacy.name }}</td>
              <td>@for (i of b.items; track $index) { <div>{{ i.medicine }} × {{ i.quantity }} @ {{ i.unitPrice | currency }}</div> }</td>
              <td><b>{{ b.total | currency }}</b></td>
              <td class="mono">block #{{ b.blockNumber }}<br />{{ b.txHash.slice(0, 18) }}…</td>
              <td>
                <app-verify-badge [result]="results()[b.id]" />
                <button class="btn-ghost btn-sm" (click)="verify(b)">Verify</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="7" class="empty">No bills found.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class Bills {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  bills = signal<Bill[]>([]);
  patients = signal<Patient[]>([]);
  results = signal<Record<string, VerifyResult>>({});
  error = signal('');
  patientId: number | null = this.route.snapshot.queryParamMap.has('patientId') ? Number(this.route.snapshot.queryParamMap.get('patientId')) : null;
  date = '';

  constructor() {
    this.api.patients().subscribe((p) => this.patients.set(p));
    this.load();
  }

  load() {
    this.api.bills(this.patientId, this.date).subscribe({
      next: (b) => { this.bills.set(b); this.results.set({}); },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  clear() { this.patientId = null; this.date = ''; this.load(); }

  verify(b: Bill) {
    this.api.verifyBill(b.id).subscribe({
      next: (r) => this.results.update((m) => ({ ...m, [b.id]: r })),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  verifyAll() { this.bills().forEach((b) => this.verify(b)); }
}
