import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const roleGuard = (role: Role): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const s = auth.session();
  if (!s) return router.createUrlTree(['/login']);
  return s.role === role ? true : router.createUrlTree([auth.homeFor(s.role)]);
};
