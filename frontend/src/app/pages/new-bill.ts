import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/auth.interceptor';
import { BillItem, Patient } from '../core/models';

@Component({
  selector: 'app-new-bill',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <h1 class="page-title">Add Bill</h1>
    <p class="page-sub">Choose a patient and add the medicines. The bill is fingerprinted on the blockchain when saved.</p>
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
          <div class="form-group"><label>Bill date</label><input name="date" type="date" [(ngModel)]="date" /></div>
        </div>

        <h3 style="margin:1.5rem 0 .8rem">Items</h3>
        @for (i of items; track $index) {
          <div class="form-grid" style="margin-bottom:.8rem;align-items:end">
            <div class="form-group"><label>Medicine</label><input [name]="'m' + $index" [(ngModel)]="i.medicine" required /></div>
            <div class="form-group"><label>Quantity</label><input [name]="'q' + $index" type="number" min="1" [(ngModel)]="i.quantity" required /></div>
            <div class="form-group"><label>Unit price</label><input [name]="'u' + $index" type="number" min="0" step="0.01" [(ngModel)]="i.unitPrice" required /></div>
            <div><button class="btn-danger btn-sm" type="button" (click)="removeItem($index)" [disabled]="items.length === 1">Remove</button></div>
          </div>
        }
        <button class="btn-ghost" type="button" (click)="addItem()">+ Add item</button>

        <p style="margin:1.5rem 0;font-size:1.3rem">Total: <b>{{ total() | currency }}</b></p>
        <button class="btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving to blockchain…' : 'Save Bill' }}</button>
      </form>
    </div>
  `,
})
export class NewBill {
  private api = inject(ApiService);
  patients = signal<Patient[]>([]);
  error = signal('');
  success = signal('');
  saving = signal(false);
  patientId: number | null = null;
  date = '';
  items: BillItem[] = [{ medicine: '', quantity: 1, unitPrice: 0 }];

  constructor() { this.api.patients().subscribe((p) => this.patients.set(p)); }

  total() { return this.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0); }
  addItem() { this.items.push({ medicine: '', quantity: 1, unitPrice: 0 }); }
  removeItem(i: number) { this.items.splice(i, 1); }

  submit() {
    this.error.set(''); this.success.set('');
    if (!this.patientId) { this.error.set('Please select a patient.'); return; }
    this.saving.set(true);
    this.api.addBill({ patientId: this.patientId, billDate: this.date || null, items: this.items }).subscribe({
      next: (b) => {
        this.saving.set(false);
        this.success.set(`Bill saved and anchored in block #${b.blockNumber} (tx ${b.txHash.slice(0, 14)}…).`);
        this.items = [{ medicine: '', quantity: 1, unitPrice: 0 }];
        this.patientId = null; this.date = '';
      },
      error: (e) => { this.saving.set(false); this.error.set(errorMessage(e)); },
    });
  }
}
