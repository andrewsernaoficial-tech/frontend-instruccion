import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Operaciones } from '../../../core/api';

@Component({
  selector: 'app-iniciar-sesion',
  imports: [FormsModule, RouterLink],
  templateUrl: './iniciar-sesion.html',
  styleUrls: ['../formulario-acceso.css', './iniciar-sesion.css'],
})
export class IniciarSesion extends Operaciones {
  private readonly router = inject(Router);
  readonly visible = signal(false);
  usuario = '';
  password = '';

  enviar() {
    void this.ejecutar(async () => {
      const credencial = await this.api.iniciarSesion({ usuario: this.usuario.trim(), password: this.password });
      this.session.iniciar(credencial);
      await this.router.navigateByUrl('/inicio');
    });
  }
}
