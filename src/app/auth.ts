import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Operaciones } from './api';

@Component({
  selector: 'app-acceso',
  imports: [FormsModule],
  template: `
  <main class="access">
    <section class="access-aside" aria-label="InstrucciónFácil">
      <div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>Instrucción<strong>Fácil</strong><small>ESCUELA DE MANEJO</small></span></div>
      <div class="access-caption"><h1>Tu próxima clase empieza aquí.</h1><p>Consulta horarios, reserva tus prácticas y revisa el estado de tus pagos desde un solo lugar.</p></div>
      <div class="road" aria-hidden="true"></div>
    </section>
    <section class="access-main">
      <div class="access-card">
        <h2>{{ registrar() ? 'Crea tu cuenta' : 'Inicia sesión' }}</h2>
        <p>{{ registrar() ? 'Regístrate como alumno para reservar tus clases.' : 'Ingresa con tu correo o número de teléfono.' }}</p>
        @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
        <form #form="ngForm" (ngSubmit)="enviar()" class="form-stack">
          @if (registrar()) {
            <label>Nombre completo<input name="nombre" [(ngModel)]="nombre" required maxlength="120" autocomplete="name"></label>
            <label>Correo electrónico<input name="email" type="email" [(ngModel)]="email" email maxlength="254" autocomplete="email"></label>
            <label>Teléfono <small>Indica un correo o un teléfono</small><input name="telefono" type="tel" [(ngModel)]="telefono" pattern="\\+?[0-9]{9,15}" autocomplete="tel"></label>
          } @else {
            <label>Correo o teléfono<input name="usuario" [(ngModel)]="usuario" required maxlength="254" autocomplete="username"></label>
          }
          <label>Contraseña
            @if (registrar()) { <small>Al menos 10 caracteres, una letra y un número</small> }
            <div class="password-field">
              <input name="password" [type]="visible() ? 'text' : 'password'" [(ngModel)]="password"
                [minlength]="registrar() ? 10 : 1" maxlength="72" required [autocomplete]="registrar() ? 'new-password' : 'current-password'">
              <button type="button" class="text-button" (click)="visible.set(!visible())">{{ visible() ? 'Ocultar' : 'Mostrar' }}</button>
            </div>
          </label>
          <button class="button primary" [disabled]="form.invalid || pendiente() || (registrar() && !email.trim() && !telefono.trim())">
            {{ pendiente() ? 'Un momento…' : registrar() ? 'Crear cuenta' : 'Ingresar' }}
          </button>
        </form>
        <div class="access-switch">{{ registrar() ? '¿Ya tienes cuenta?' : '¿Aún no tienes una cuenta?' }}
          <button class="text-button" type="button" (click)="alternar()">{{ registrar() ? 'Inicia sesión' : 'Regístrate' }}</button>
        </div>
      </div>
    </section>
  </main>`
})
export class Acceso extends Operaciones {
  private readonly router = inject(Router);
  readonly registrar = signal(false);
  readonly visible = signal(false);
  nombre = '';
  usuario = '';
  email = '';
  telefono = '';
  password = '';

  alternar() {
    this.registrar.update(actual => !actual);
    this.error.set('');
    this.password = '';
    this.visible.set(false);
  }

  enviar() {
    void this.ejecutar(async () => {
      let usuario = this.usuario.trim();
      if (this.registrar()) {
        const email = this.email.trim() || null;
        const telefono = this.telefono.trim() || null;
        if (!email && !telefono) throw new Error('Indica tu correo o tu teléfono.');
        await this.api.registrar({ nombre: this.nombre.trim(), email, telefono, password: this.password });
        usuario = email || telefono || '';
      }
      const credencial = await this.api.iniciarSesion({ usuario, password: this.password });
      this.session.iniciar(credencial);
      await this.router.navigateByUrl('/inicio');
    });
  }
}
