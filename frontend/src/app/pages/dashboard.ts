import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Stats } from '../core/models';

@Component({
  selector: 'app-dashboard',
  template: `
    <h1 class="page-title">Hospital Dashboard</h1>
    <p class="page-sub">Overview of everything recorded in the system</p>
    @if (stats(); as s) {
      <div class="stat-grid">
        <div class="stat"><div class="num">{{ s.patients }}</div><div class="lbl">Patients</div></div>
        <div class="stat"><div class="num">{{ s.pharmacies }}</div><div class="lbl">Pharmacies</div></div>
        <div class="stat"><div class="num">{{ s.labs }}</div><div class="lbl">Pathology Labs</div></div>
        <div class="stat"><div class="num">{{ s.bills }}</div><div class="lbl">Bills anchored</div></div>
        <div class="stat"><div class="num">{{ s.reports }}</div><div class="lbl">Reports anchored</div></div>
      </div>
    }
    <div class="card">
      <h3>How verification works</h3>
      <p>Each bill and lab report is hashed (SHA-256) and the hash is stored in a smart contract on the Ethereum
         network. Use <b>Verify</b> on the Bills or Reports pages to recompute the hash from the database and compare it
         with the blockchain - a mismatch means the record was altered after it was created.</p>
    </div>
  `,
})
export class Dashboard {
  stats = signal<Stats | null>(null);
  constructor() { inject(ApiService).stats().subscribe((s) => this.stats.set(s)); }
}
