import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Operaciones, roles, hoy } from '../../core/api';

@Component({
  selector: 'app-perfil', imports: [FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil extends Operaciones implements OnInit {
  readonly cargado = signal(false);
  readonly roles = roles;
  readonly hoy = hoy;
  form = { nombre: '', email: '', telefono: '', dni: '', nacimiento: '', direccion: '' };
  usuario() { return this.session.actual()!.usuario; }
  ngOnInit() {
    void this.ejecutar(async () => {
      const u = await this.api.perfil();
      this.session.perfil(u);
      this.form = { nombre: u.nombre, email: u.email ?? '', telefono: u.telefono ?? '', dni: u.dni ?? '',
        nacimiento: u.nacimiento ?? '', direccion: u.direccion ?? '' };
      this.cargado.set(true);
    });
  }
  guardar() {
    void this.ejecutar(async () => {
      const u = await this.api.actualizarPerfil({ ...this.form,
        email: this.form.email.trim() || null, telefono: this.form.telefono.trim() || null });
      this.session.perfil(u);
      this.mensaje.set('Perfil actualizado.');
    });
  }
}
