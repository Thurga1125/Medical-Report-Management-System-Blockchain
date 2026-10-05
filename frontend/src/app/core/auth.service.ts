import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, Session } from './models';

const KEY = 'medchain.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly session = signal<Session | null>(this.load());
  readonly isLoggedIn = computed(() => this.session() !== null);

  login(username: string, password: string) {
    return this.http.post<Session>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((s) => { this.session.set(s); sessionStorage.setItem(KEY, JSON.stringify(s)); }),
    );
  }

  logout() {
    this.session.set(null);
    sessionStorage.removeItem(KEY);
    this.router.navigate(['/login']);
  }

  homeFor(role: Role): string {
    return { HOSPITAL: '/hospital', PHARMACY: '/pharmacy', LAB: '/lab' }[role];
  }

  private load(): Session | null {
    try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null'); } catch { return null; }
  }
}
