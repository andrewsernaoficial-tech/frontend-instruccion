import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from '../services/session.service';
import type { Rol } from '../contrato-api';

export const autorizado = (...roles: Rol[]): CanActivateFn => () => {
  const session = inject(Session);
  const router = inject(Router);
  if (!session.token()) return router.createUrlTree(['/acceso']);
  return !roles.length || roles.includes(session.actual()!.usuario.rol) ? true : router.createUrlTree(['/inicio']);
};

export const visitante: CanActivateFn = () => inject(Session).token()
  ? inject(Router).createUrlTree(['/inicio']) : true;

