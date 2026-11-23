import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Session, roles } from '../../core/api';

@Component({
  selector: 'app-panel', imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  readonly session = inject(Session);
  private readonly router = inject(Router);
  readonly menu = signal(false);
  readonly roles = roles;
  readonly links = [
    { path: '/inicio', name: 'Inicio', icon: '⌂' },
    { path: '/agenda', name: 'Agenda', icon: '▦' },
    { path: '/reservar', name: 'Nueva reserva', icon: '+', roles: ['CLIENTE', 'RECEPCION', 'ADMIN'] },
    { path: '/horarios', name: 'Mis horarios', icon: '◷', roles: ['INSTRUCTOR'] },
    { path: '/horarios', name: 'Horarios', icon: '◷', roles: ['RECEPCION', 'ADMIN'] },
    { path: '/flota', name: 'Flota vehicular', icon: '▱', roles: ['RECEPCION', 'ADMIN'] },
    { path: '/pagos', name: 'Revisión de pagos', icon: '✓', roles: ['RECEPCION', 'ADMIN'] },
    { path: '/finanzas', name: 'Finanzas', icon: '▥', roles: ['ADMIN'] },
    { path: '/gestion', name: 'Gestión de la escuela', icon: '□', roles: ['RECEPCION', 'ADMIN'] },
    { path: '/perfil', name: 'Mi perfil', icon: '◎' }
  ];
  salir() {
    this.session.salir();
    void this.router.navigateByUrl('/acceso');
  }
}
