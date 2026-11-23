import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { diaSiguiente, hoy, Operaciones } from '../../core/api';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['../acceso/formulario-acceso.css', './registro.css'],
})
export class Registro extends Operaciones {
  private readonly router = inject(Router);
  readonly visible = signal(false);

  readonly fechaMaxima = diaSiguiente(hoy(), -1);
  nombre = '';
  email = '';
  telefono = '';
  dni = '';
  nacimiento = '';
  direccion = '';
  password = '';

  enviar() {
    void this.ejecutar(async () => {
      const email = this.email.trim();
      await this.api.registrar({
        nombre: this.nombre.trim(), email, telefono: this.telefono.trim(), dni: this.dni.trim(),
        nacimiento: this.nacimiento, direccion: this.direccion.trim(), password: this.password
      });
      const credencial = await this.api.iniciarSesion({ usuario: email, password: this.password });
      this.session.iniciar(credencial);
      await this.router.navigateByUrl('/inicio');
    });
  }
}
