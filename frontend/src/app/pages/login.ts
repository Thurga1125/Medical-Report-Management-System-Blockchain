import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errorMessage } from '../core/auth.interceptor';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">🏥 MedChain</div>
          <h2>Welcome Back</h2>
          <p>Sign in as Hospital, Pharmacy or Pathology Lab</p>
        </div>
        @if (error()) { <div class="error-message">{{ error() }}</div> }
        <form class="auth-form" (ngSubmit)="submit()">
          <div class="form-group">
            <label for="u">Username</label>
            <input id="u" name="username" [(ngModel)]="username" placeholder="Enter your username" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="p">Password</label>
            <input id="p" name="password" type="password" [(ngModel)]="password" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <button class="btn-submit" type="submit" [disabled]="loading()">{{ loading() ? 'Signing in…' : 'Sign In' }}</button>
        </form>
        <p style="text-align:center;margin-top:1.5rem"><a routerLink="/">Back to Home</a></p>
      </div>
    </div>
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = '';
  password = '';
  error = signal('');
  loading = signal(false);

  submit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: (s) => this.router.navigate([this.auth.homeFor(s.role)]),
      error: (e) => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
