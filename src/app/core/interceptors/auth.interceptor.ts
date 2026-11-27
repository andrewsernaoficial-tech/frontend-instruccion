import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Session } from '../services/session.service';

export const autenticar: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/v1/')) return next(request);
  const session = inject(Session);
  const router = inject(Router);
  const token = session.token();
  const publica = request.url.includes('/auth/') || request.url.endsWith('/health');
  const autenticada = token && !publica
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(autenticada).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && !publica) {
      session.salir();
      void router.navigateByUrl('/acceso');
    }
    return throwError(() => error);
  }));
};
