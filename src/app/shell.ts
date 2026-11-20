import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Session, roles } from './api';

@Component({
  selector: 'app-panel', imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  @if (session.actual(); as activa) {
    <div class="layout">
      <aside class="sidebar" [class.expanded]="menu()">
        <a class="brand" routerLink="/inicio" (click)="menu.set(false)">
          <span class="brand-mark" aria-hidden="true"></span><span>Instrucción<strong>Fácil</strong><small>ESCUELA DE MANEJO</small></span>
        </a>
        <nav aria-label="Navegación principal">
          @for (item of links; track item.path) {
            @if (!item.roles || item.roles.includes(activa.usuario.rol)) {
              <a [routerLink]="item.path" routerLinkActive="current" ariaCurrentWhenActive="page" (click)="menu.set(false)">
                <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>{{ item.name }}
              </a>
            }
          }
        </nav>
        <button type="button" class="logout" (click)="salir()"><span class="nav-icon" aria-hidden="true">↪</span>Cerrar sesión</button>
      </aside>
      <div class="shell-main">
        <header class="topbar">
          <button class="button secondary mobile-menu" type="button" (click)="menu.set(!menu())" [attr.aria-expanded]="menu()">Menú</button>
          <span class="portal-title">Portal de la escuela</span>
          <a class="identity" routerLink="/perfil">
            <span class="avatar" aria-hidden="true">{{ activa.usuario.nombre.slice(0, 1).toUpperCase() }}</span>
            <span>{{ activa.usuario.nombre }}<small>{{ roles[activa.usuario.rol] }}</small></span>
          </a>
        </header>
        <main id="contenido" class="content"><router-outlet /></main>
      </div>
    </div>
  }`
})
export class Panel {
  readonly session = inject(Session);
  private readonly router = inject(Router);
  readonly menu = signal(false);
  readonly roles = roles;
  readonly links = [
    { path: '/inicio', name: 'Resumen', icon: '▦' },
    { path: '/agenda', name: 'Agenda', icon: '▤' },
    { path: '/reservar', name: 'Nueva reserva', icon: '+', roles: ['CLIENTE', 'RECEPCION', 'ADMIN'] },
    { path: '/pagos', name: 'Revisión de pagos', icon: '≋', roles: ['RECEPCION', 'ADMIN'] },
    { path: '/gestion', name: 'Gestión de la escuela', icon: '□', roles: ['RECEPCION', 'ADMIN'] },
    { path: '/perfil', name: 'Mi perfil', icon: '◎' }
  ];
  salir() {
    this.session.salir();
    void this.router.navigateByUrl('/acceso');
  }
}
