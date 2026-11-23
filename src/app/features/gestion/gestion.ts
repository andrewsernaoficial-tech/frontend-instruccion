import { Component, inject, signal } from '@angular/core';
import { Session } from '../../core/api';
import { Clases } from './clases/clases';
import { Horarios } from './horarios/horarios';
import { Flota } from './flota/flota';
import { Personal } from './personal/personal';
import { Auditoria } from './auditoria/auditoria';

type Seccion = 'Clases' | 'Horarios' | 'Flota' | 'Personal' | 'Auditoría';

@Component({
  selector: 'app-gestion',
  imports: [Clases, Horarios, Flota, Personal, Auditoria],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class Gestion {
  private readonly session = inject(Session);
  readonly seccion = signal<Seccion>(this.admin() ? 'Clases' : 'Horarios');
  readonly visitadas = signal<Seccion[]>([this.seccion()]);

  admin() { return this.session.actual()?.usuario.rol === 'ADMIN'; }
  instructor() { return this.session.actual()?.usuario.rol === 'INSTRUCTOR'; }
  secciones(): Seccion[] {
    if (this.instructor()) return ['Horarios'];
    return this.admin() ? ['Clases', 'Horarios', 'Flota', 'Personal', 'Auditoría'] : ['Horarios', 'Flota'];
  }
  mostrar(seccion: Seccion) {
    if (!this.secciones().includes(seccion)) return;
    this.seccion.set(seccion);
    if (!this.visitadas().includes(seccion)) this.visitadas.update(actuales => [...actuales, seccion]);
  }
}
