import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protege /panel: si no iniciaste sesión, te manda a /login */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaLogueada() ? true : inject(Router).createUrlTree(['/login']);
};

/** En /login: si ya iniciaste sesión, te manda directo al panel */
export const invitadaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaLogueada() ? inject(Router).createUrlTree(['/panel']) : true;
};
