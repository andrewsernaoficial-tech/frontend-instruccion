import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Operaciones, Pago, Usuario, fechaVisible, hora, hoy, medios, roles, soles } from './api';

@Component({
  selector: 'app-pagos', imports: [FormsModule, RouterLink],
  template: `
  <div class="page-head"><div><h1>Revisión de pagos</h1><p>Verifica los comprobantes pendientes de las reservas.</p></div>
    <button type="button" class="button secondary" [disabled]="pendiente()" (click)="actualizar()">Actualizar</button>
  </div>
  @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
  @if (mensaje()) { <div class="feedback good" role="status">{{ mensaje() }}</div> }
  <div class="split">
    <article class="card schedule">
      <div class="card-head"><h2>Por revisar</h2><span class="count">{{ pagos().length }}</span></div>
      @for (p of pagos(); track p.id) {
        <button class="schedule-row" type="button" [class.selected]="seleccion()?.id === p.id" (click)="seleccionar(p)" [disabled]="pendiente()">
          <span class="tile-time">{{ medios[p.medio].slice(0, 2) }}</span>
          <span><strong>Cita #{{ p.citaId }} · {{ medios[p.medio] }}</strong><small>{{ fechaVisible(p.creado) }} a las {{ hora(p.creado) }}</small></span>
          <strong>{{ soles(p.monto) }}</strong>
        </button>
      } @empty { <p class="empty">{{ pendiente() ? 'Cargando pagos…' : 'No hay comprobantes por revisar.' }}</p> }
    </article>
    @if (seleccion(); as p) {
      <article class="card details">
        <h2>Comprobante #{{ p.id }}</h2>
        <dl class="facts">
          <div><dt>Cita</dt><dd><a class="text-button" routerLink="/agenda" [queryParams]="{ id: p.citaId }">Ver cita #{{ p.citaId }}</a></dd></div>
          <div><dt>Medio</dt><dd>{{ medios[p.medio] }}</dd></div>
          <div><dt>Operación</dt><dd>{{ p.operacion }}</dd></div>
          <div><dt>Importe</dt><dd>{{ soles(p.monto) }}</dd></div>
        </dl>
        <button type="button" class="button secondary" [disabled]="pendiente()" (click)="descargar(p.id)">Descargar comprobante</button>
        <form #r="ngForm" class="form-stack top-gap" (ngSubmit)="resolver(p.id, false)">
          <label>Motivo del rechazo<input name="motivo" [(ngModel)]="motivo" maxlength="240"></label>
          <div class="button-row">
            <button type="button" class="button primary" [disabled]="pendiente()" (click)="resolver(p.id, true)">Aprobar pago</button>
            <button class="button danger" [disabled]="!motivo.trim() || pendiente()">Rechazar pago</button>
          </div>
        </form>
      </article>
    }
  </div>`
})
export class Pagos extends Operaciones implements OnInit {
  readonly pagos = signal<Pago[]>([]);
  readonly seleccion = signal<Pago | null>(null);
  readonly medios = medios;
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  readonly soles = soles;
  motivo = '';
  ngOnInit() { this.actualizar(); }
  actualizar() { void this.ejecutar(() => this.cargar()); }
  seleccionar(pago: Pago) { this.seleccion.set(pago); this.motivo = ''; }
  resolver(id: number, aprobar: boolean) {
    void this.ejecutar(async () => {
      await this.api.patch(`/admin/pagos/${id}/revision`, { aprobar, motivo: aprobar ? null : this.motivo.trim() });
      this.seleccion.set(null);
      await this.cargar();
      this.mensaje.set(aprobar ? 'Pago aprobado y cita confirmada.' : 'Pago rechazado.');
    });
  }
  descargar(id: number) {
    void this.ejecutar(async () => {
      const result = await this.api.documento(id);
      if (!result.body) throw new Error('El comprobante está vacío.');
      const extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[result.body.type] || 'bin';
      const url = URL.createObjectURL(result.body);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `comprobante-${id}.${extension}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  private async cargar() {
    const lista = await this.api.get<Pago[]>('/admin/pagos/pendientes');
    this.pagos.set(lista);
    if (!lista.some(p => p.id === this.seleccion()?.id)) this.seleccion.set(null);
  }
}

@Component({
  selector: 'app-perfil', imports: [FormsModule],
  template: `
  <div class="page-head"><div><h1>Mi perfil</h1><p>Revisa y actualiza tus datos de contacto.</p></div></div>
  @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
  @if (mensaje()) { <div class="feedback good" role="status">{{ mensaje() }}</div> }
  @if (cargado()) {
    <article class="card details narrow">
      <div class="profile-header"><span class="avatar" aria-hidden="true">{{ usuario().nombre.slice(0,1).toUpperCase() }}</span>
        <div><h2>{{ usuario().nombre }}</h2><p class="muted">{{ roles[usuario().rol] }}</p></div></div>
      <form #f="ngForm" class="form-stack" (ngSubmit)="guardar()">
        <label>Nombre completo<input name="nombre" [(ngModel)]="form.nombre" maxlength="120" required></label>
        <div class="form-grid">
          <label>Correo electrónico<input name="email" type="email" email [(ngModel)]="form.email" maxlength="254"></label>
          <label>Teléfono<input name="telefono" type="tel" [(ngModel)]="form.telefono" pattern="\\+?[0-9]{9,15}"></label>
          <label>DNI<input name="dni" [(ngModel)]="form.dni" pattern="[0-9]{8}" maxlength="8" inputmode="numeric" required></label>
          <label>Fecha de nacimiento<input name="nacimiento" type="date" [(ngModel)]="form.nacimiento" [max]="hoy()" required></label>
        </div>
        <label>Dirección<input name="direccion" [(ngModel)]="form.direccion" maxlength="240" required></label>
        <button class="button primary" [disabled]="f.invalid || pendiente() || (!form.email.trim() && !form.telefono.trim())">Guardar perfil</button>
      </form>
    </article>
  }`
})
export class Perfil extends Operaciones implements OnInit {
  readonly cargado = signal(false);
  readonly roles = roles;
  readonly hoy = hoy;
  form = { nombre: '', email: '', telefono: '', dni: '', nacimiento: '', direccion: '' };
  usuario() { return this.session.actual()!.usuario; }
  ngOnInit() {
    void this.ejecutar(async () => {
      const u = await this.api.get<Usuario>('/usuarios/me');
      this.session.perfil(u);
      this.form = { nombre: u.nombre, email: u.email ?? '', telefono: u.telefono ?? '', dni: u.dni ?? '',
        nacimiento: u.nacimiento ?? '', direccion: u.direccion ?? '' };
      this.cargado.set(true);
    });
  }
  guardar() {
    void this.ejecutar(async () => {
      const u = await this.api.put<Usuario>('/usuarios/me', { ...this.form,
        email: this.form.email.trim() || null, telefono: this.form.telefono.trim() || null });
      this.session.perfil(u);
      this.mensaje.set('Perfil actualizado.');
    });
  }
}
