import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

const NAV = {
  HOSPITAL: [
    { path: '/hospital', label: '📊 Dashboard', exact: true },
    { path: '/hospital/pharmacies', label: '💊 Pharmacies' },
    { path: '/hospital/labs', label: '🔬 Pathology Labs' },
    { path: '/hospital/patients', label: '👥 Patients' },
    { path: '/hospital/bills', label: '🧾 Pharmacy Bills' },
    { path: '/hospital/reports', label: '📄 Lab Reports' },
  ],
  PHARMACY: [
    { path: '/pharmacy', label: '➕ Add Bill', exact: true },
    { path: '/pharmacy/bills', label: '🧾 View Bills' },
  ],
  LAB: [
    { path: '/lab', label: '➕ Add Report', exact: true },
    { path: '/lab/reports', label: '📄 View Reports' },
  ],
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <h2>🏥 MedChain</h2>
        <div class="who">{{ auth.session()?.organizationName }}<br />({{ auth.session()?.username }})</div>
        <nav class="nav">
          @for (n of links(); track n.path) {
            <a [routerLink]="n.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !!n.exact }">{{ n.label }}</a>
          }
        </nav>
        <button class="btn-secondary" style="color:#fff;border-color:#fff" (click)="auth.logout()">Logout</button>
      </aside>
      <main class="content"><router-outlet /></main>
    </div>
  `,
})
export class Shell {
  auth = inject(AuthService);
  links = computed(() => NAV[this.auth.session()!.role]);
}
