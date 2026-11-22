import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CanActivateFn, Router, RouterOutlet, Routes, provideRouter } from '@angular/router';
import { Session, Rol, autenticar } from './app/api';
import { Acceso } from './app/auth';
import { Panel } from './app/shell';
import { Agenda, Resumen } from './app/agenda';
import { Reserva } from './app/reserva';
import { Gestion } from './app/gestion';
import { Pagos, Perfil } from './app/cuenta';

const autorizado = (...roles: Rol[]): CanActivateFn => () => {
  const session = inject(Session);
  const router = inject(Router);
  if (!session.token()) return router.createUrlTree(['/acceso']);
  return !roles.length || roles.includes(session.actual()!.usuario.rol) ? true : router.createUrlTree(['/inicio']);
};

const routes: Routes = [
  { path: 'acceso', component: Acceso, canActivate: [() => inject(Session).token()
    ? inject(Router).createUrlTree(['/inicio']) : true] },
  { path: '', component: Panel, canActivate: [autorizado()], canActivateChild: [autorizado()], children: [
    { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    { path: 'inicio', component: Resumen },
    { path: 'agenda', component: Agenda },
    { path: 'reservar', component: Reserva, canActivate: [autorizado('CLIENTE', 'RECEPCION', 'ADMIN')] },
    { path: 'gestion', component: Gestion, canActivate: [autorizado('INSTRUCTOR', 'RECEPCION', 'ADMIN')] },
    { path: 'pagos', component: Pagos, canActivate: [autorizado('RECEPCION', 'ADMIN')] },
    { path: 'perfil', component: Perfil },
  ] },
  { path: '**', redirectTo: 'inicio' }
];

@Component({ selector: 'app-root', imports: [RouterOutlet], template: '<router-outlet />' })
class App {}

bootstrapApplication(App, { providers: [provideRouter(routes), provideHttpClient(withInterceptors([autenticar]))] })
  .catch(console.error);
