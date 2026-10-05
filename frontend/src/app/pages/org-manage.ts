import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { errorMessage } from '../core/auth.interceptor';
import { Org } from '../core/models';

/** Manage pharmacies or pathology labs; the route's `kind` data decides which. */
@Component({
  selector: 'app-org-manage',
  imports: [FormsModule],
  template: `
    <h1 class="page-title">Manage {{ title }}</h1>
    <p class="page-sub">Add, update, delete and view {{ title.toLowerCase() }}. Each one gets its own login.</p>
    @if (error()) { <div class="error-message">{{ error() }}</div> }

    <div class="card">
      <h3>{{ form.id ? 'Edit' : 'Add' }} {{ singular }}</h3>
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-group"><label>Name *</label><input name="name" [(ngModel)]="form.name" required /></div>
          <div class="form-group"><label>License No.</label><input name="license" [(ngModel)]="form.licenseNo" /></div>
          <div class="form-group"><label>Phone</label><input name="phone" [(ngModel)]="form.phone" /></div>
          <div class="form-group"><label>Email</label><input name="email" type="email" [(ngModel)]="form.email" /></div>
          <div class="form-group"><label>Address</label><input name="address" [(ngModel)]="form.address" /></div>
          @if (!form.id) {
            <div class="form-group"><label>Login username *</label><input name="username" [(ngModel)]="form.username" required /></div>
            <div class="form-group"><label>Login password * (6+ chars)</label><input name="password" type="password" [(ngModel)]="form.password" required minlength="6" /></div>
          }
        </div>
        <div class="actions" style="margin-top:1rem">
          <button class="btn-primary" type="submit">{{ form.id ? 'Update' : 'Add' }}</button>
          @if (form.id) { <button class="btn-secondary" type="button" (click)="reset()">Cancel</button> }
        </div>
      </form>
    </div>

    <div class="card table-wrap">
      <table>
        <thead><tr><th>Name</th><th>License</th><th>Phone</th><th>Email</th><th>Address</th><th></th></tr></thead>
        <tbody>
          @for (o of items(); track o.id) {
            <tr>
              <td><b>{{ o.name }}</b></td><td>{{ o.licenseNo }}</td><td>{{ o.phone }}</td><td>{{ o.email }}</td><td>{{ o.address }}</td>
              <td class="actions">
                <button class="btn-ghost btn-sm" (click)="edit(o)">Edit</button>
                <button class="btn-danger btn-sm" (click)="remove(o)">Delete</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="6" class="empty">Nothing here yet.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class OrgManage {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  kind: 'pharmacies' | 'labs' = this.route.snapshot.data['kind'];
  title = this.kind === 'pharmacies' ? 'Pharmacies' : 'Pathology Labs';
  singular = this.kind === 'pharmacies' ? 'Pharmacy' : 'Pathology Lab';
  items = signal<Org[]>([]);
  error = signal('');
  form: Org = { name: '' };

  constructor() { this.load(); }

  load() { this.api.orgs(this.kind).subscribe((r) => this.items.set(r)); }
  edit(o: Org) { this.form = { ...o }; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  reset() { this.form = { name: '' }; }

  save() {
    this.error.set('');
    this.api.saveOrg(this.kind, this.form).subscribe({
      next: () => { this.reset(); this.load(); },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  remove(o: Org) {
    if (!confirm(`Delete ${o.name}? Its login will be removed too.`)) return;
    this.error.set('');
    this.api.deleteOrg(this.kind, o.id!).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}
