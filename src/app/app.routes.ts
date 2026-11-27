import { Routes } from '@angular/router';
import { autorizado, visitante } from './core/guards/auth.guard';
import { Acceso } from './features/acceso/acceso';
import { IniciarSesion } from './features/acceso/iniciar-sesion/iniciar-sesion';
import { Registro } from './features/registro/registro';
import { Panel } from './layout/panel/panel';
import { Agenda } from './features/agenda/agenda';
import { Resumen } from './features/resumen/resumen';
import { Reserva } from './features/reserva/reserva';
import { Gestion } from './features/gestion/gestion';
import { Flota } from './features/gestion/flota/flota';
import { Horarios } from './features/gestion/horarios/horarios';
import { Pagos } from './features/pagos/pagos';
import { Perfil } from './features/perfil/perfil';
import { Ingresos } from './features/ingresos/ingresos';

export const routes: Routes = [
  { path: 'acceso', component: Acceso, canActivate: [visitante],
    children: [{ path: '', component: IniciarSesion }] },
  { path: 'registro', component: Acceso, canActivate: [visitante],
    children: [{ path: '', component: Registro }] },
  { path: '', component: Panel, canActivate: [autorizado()], canActivateChild: [autorizado()], children: [
    { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    { path: 'inicio', component: Resumen },
    { path: 'agenda', component: Agenda },
    { path: 'reservar', component: Reserva, canActivate: [autorizado('CLIENTE', 'RECEPCION', 'ADMIN')] },
    { path: 'gestion', component: Gestion, canActivate: [autorizado('INSTRUCTOR', 'RECEPCION', 'ADMIN')] },
    { path: 'horarios', component: Horarios, canActivate: [autorizado('INSTRUCTOR', 'RECEPCION', 'ADMIN')] },
    { path: 'flota', component: Flota, canActivate: [autorizado('RECEPCION', 'ADMIN')] },
    { path: 'pagos', component: Pagos, canActivate: [autorizado('RECEPCION', 'ADMIN')] },
    { path: 'finanzas', component: Ingresos, canActivate: [autorizado('ADMIN')] },
    { path: 'ingresos', pathMatch: 'full', redirectTo: 'finanzas' },
    { path: 'perfil', component: Perfil },
  ] },
  { path: '**', redirectTo: 'inicio' }
];
