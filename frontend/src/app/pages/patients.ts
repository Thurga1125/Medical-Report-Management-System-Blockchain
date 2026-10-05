import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/auth.interceptor';
import { Patient } from '../core/models';

@Component({
  selector: 'app-patients',
  imports: [FormsModule, RouterLink],
  template: `
    <h1 class="page-title">Manage Patients</h1>
    <p class="page-sub">Add, update, delete and view patients, and open their bills and lab reports.</p>
    @if (error()) { <div class="error-message">{{ error() }}</div> }

    <div class="card">
      <h3>{{ form.id ? 'Edit' : 'Add' }} Patient</h3>
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-group"><label>Name *</label><input name="name" [(ngModel)]="form.name" required /></div>
          <div class="form-group"><label>Date of birth</label><input name="dob" type="date" [(ngModel)]="form.dateOfBirth" /></div>
          <div class="form-group"><label>Gender</label>
            <select name="gender" [(ngModel)]="form.gender"><option value="">-</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="form-group"><label>Blood group</label><input name="bg" [(ngModel)]="form.bloodGroup" placeholder="e.g. O+" /></div>
          <div class="form-group"><label>Phone</label><input name="phone" [(ngModel)]="form.phone" /></div>
          <div class="form-group"><label>Email</label><input name="email" type="email" [(ngModel)]="form.email" /></div>
          <div class="form-group"><label>Address</label><input name="address" [(ngModel)]="form.address" /></div>
        </div>
        <div class="actions" style="margin-top:1rem">
          <button class="btn-primary" type="submit">{{ form.id ? 'Update' : 'Add' }}</button>
          @if (form.id) { <button class="btn-secondary" type="button" (click)="reset()">Cancel</button> }
        </div>
      </form>
    </div>

    <div class="card table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>DOB</th><th>Gender</th><th>Blood</th><th>Phone</th><th></th></tr></thead>
        <tbody>
          @for (p of items(); track p.id) {
            <tr>
              <td>{{ p.id }}</td><td><b>{{ p.name }}</b></td><td>{{ p.dateOfBirth }}</td><td>{{ p.gender }}</td><td>{{ p.bloodGroup }}</td><td>{{ p.phone }}</td>
              <td class="actions">
                <a class="btn-ghost btn-sm" style="text-decoration:none;border-radius:8px;padding:.35rem .8rem" [routerLink]="['/hospital/bills']" [queryParams]="{ patientId: p.id }">Bills</a>
                <a class="btn-ghost btn-sm" style="text-decoration:none;border-radius:8px;padding:.35rem .8rem" [routerLink]="['/hospital/reports']" [queryParams]="{ patientId: p.id }">Reports</a>
                <button class="btn-ghost btn-sm" (click)="edit(p)">Edit</button>
                <button class="btn-danger btn-sm" (click)="remove(p)">Delete</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="7" class="empty">No patients yet.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class Patients {
  private api = inject(ApiService);
  items = signal<Patient[]>([]);
  error = signal('');
  form: Patient = { name: '' };

  constructor() { this.load(); }

  load() { this.api.patients().subscribe((r) => this.items.set(r)); }
  edit(p: Patient) { this.form = { ...p }; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  reset() { this.form = { name: '' }; }

  save() {
    this.error.set('');
    const body = { ...this.form, dateOfBirth: this.form.dateOfBirth || null };
    this.api.savePatient(body).subscribe({
      next: () => { this.reset(); this.load(); },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  remove(p: Patient) {
    if (!confirm(`Delete patient ${p.name}?`)) return;
    this.error.set('');
    this.api.deletePatient(p.id!).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}
