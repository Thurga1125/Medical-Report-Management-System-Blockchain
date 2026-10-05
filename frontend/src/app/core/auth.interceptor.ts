import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.session()?.token;
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      // Expired/invalid token on a protected call -> back to login.
      if (err.status === 401 && token) auth.logout();
      return throwError(() => err);
    }),
  );
};

/** Turns an HTTP error into a message fit for the UI. */
export function errorMessage(err: unknown): string {
  const e = err as HttpErrorResponse;
  if (e?.status === 0) return 'Cannot reach the server. Is the backend running?';
  return e?.error?.message ?? 'Something went wrong. Please try again.';
}
