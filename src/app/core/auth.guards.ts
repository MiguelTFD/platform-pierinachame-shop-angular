import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protege /panel: si NO iniciaste sesión, te manda a /login */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  if (auth.isLogged() === false) {
    return inject(Router).createUrlTree(['/login']);
  }

  return true;
};

/** Protege /login: si YA iniciaste sesión, no tiene sentido ver el login, te manda al panel */
export const invitadaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  if (auth.isLogged() === true) {
    return inject(Router).createUrlTree(['/panel']);
  }

  return true;
};