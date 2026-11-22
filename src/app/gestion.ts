import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bloqueo, Clase, Evento, Horario, Operaciones, Persona, Personal, Vehiculo,
  fechaVisible, hora, hoy, soles, transmisiones } from './api';

type Seccion = 'Clases' | 'Horarios' | 'Flota' | 'Personal' | 'Auditoría';
const claseNueva = () => ({ nombre: '', minutos: 60, tarifa: 0, activo: true });
const vehiculoNuevo = (): Omit<Vehiculo, 'id'> => ({ placa: '', descripcion: '', transmision: 'MECANICA', activo: true });

@Component({
  selector: 'app-gestion', imports: [FormsModule],
  template: `
  <div class="page-head"><div><h1>Gestión de la escuela</h1><p>Consulta y organiza la operación de la escuela.</p></div></div>
  <nav class="tabs" aria-label="Secciones de gestión">
    @for (s of secciones(); track s) { <button type="button" [class.active]="seccion() === s" [attr.aria-pressed]="seccion() === s"
      (click)="mostrar(s)" [disabled]="pendiente()">{{ s }}</button> }
  </nav>
  @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
  @if (mensaje()) { <div class="feedback good" role="status">{{ mensaje() }}</div> }

  @switch (seccion()) {
    @case ('Clases') {
      <div class="split">
        <article class="card details">
          <h2>{{ claseId ? 'Editar clase' : 'Nueva clase' }}</h2>
          <form class="form-stack" #c="ngForm" (ngSubmit)="guardarClase()">
            <label>Nombre de la clase<input name="nombre" [(ngModel)]="formClase.nombre" maxlength="100" required></label>
            <div class="form-grid">
              <label>Duración en minutos<input name="minutos" type="number" min="15" max="480" [(ngModel)]="formClase.minutos" required></label>
              <label>Tarifa en soles<input name="tarifa" type="number" min="0.01" max="99999999.99" step="0.01" [(ngModel)]="formClase.tarifa" required></label>
            </div>
            <label class="check"><input name="activa" type="checkbox" [(ngModel)]="formClase.activo"> Disponible para reservas</label>
            <div class="button-row"><button class="button primary" [disabled]="c.invalid || pendiente()">Guardar clase</button>
              @if (claseId) { <button type="button" class="button secondary" (click)="editarClase()">Nueva clase</button> }</div>
          </form>
        </article>
        <article class="card schedule"><div class="card-head"><h2>Catálogo</h2><span class="count">{{ clases().length }}</span></div>
          @for (r of clases(); track r.id) { <div class="list-row"><div><strong>{{ r.nombre }}</strong><small>{{ r.minutos }} min · {{ soles(r.tarifa) }} · {{ r.activo ? 'Activa' : 'Inactiva' }}</small></div>
            <button class="text-button" type="button" [disabled]="pendiente()" (click)="editarClase(r)">Editar</button></div>
          } @empty { <p class="empty">{{ pendiente() ? 'Cargando…' : 'Todavía no hay clases.' }}</p> }
        </article>
      </div>
    }
    @case ('Horarios') {
      <form class="card filter-bar" #h="ngForm" (ngSubmit)="consultarHorario()">
        <label>Instructor<select name="instructor" [(ngModel)]="instructorId" (ngModelChange)="limpiarHorarios()" required>
          <option [ngValue]="null" disabled>Selecciona un instructor</option>
          @for (i of instructores(); track i.id) { <option [ngValue]="i.id">{{ i.nombre }}</option> }
        </select></label>
        <label>Fecha<input name="dia" type="date" [(ngModel)]="dia" (ngModelChange)="limpiarHorarios()" required></label>
        <button class="button secondary" [disabled]="h.invalid || pendiente()">Consultar horarios</button>
      </form>
      <div class="split">
        <article class="card schedule">
          <div class="card-head"><h2>Ventanas de atención</h2><span class="count">{{ horarios().length }}</span></div>
          @for (r of horarios(); track r.id) { <div class="list-row"><div><strong>{{ hora(r.inicio) }}–{{ hora(r.fin) }}</strong><small>{{ fechaVisible(r.inicio) }}</small></div>
            @if (admin()) { <button class="text-button" type="button" [disabled]="pendiente()" (click)="quitarHorario(r.id)">Eliminar</button> }</div>
          } @empty { <p class="empty">Consulta la fecha y el instructor para ver sus horarios.</p> }
        </article>
        @if (admin()) {
          <article class="card details"><h2>Agregar horario</h2><p class="muted">Selecciona un instructor y una fecha arriba.</p>
            <form #v="ngForm" class="form-stack" (ngSubmit)="crearHorario()">
              <div class="form-grid"><label>Hora de inicio<input type="time" name="inicio" [(ngModel)]="horaInicio" required></label>
                <label>Hora de fin<input type="time" name="fin" [(ngModel)]="horaFin" required></label></div>
              <button class="button primary" [disabled]="v.invalid || h.invalid || !instructorId || pendiente()">Guardar horario</button>
            </form>
          </article>
        }
      </div>
    }
    @case ('Flota') {
      <div class="split">
        <article class="card schedule">
          <div class="card-head"><h2>Vehículos</h2><span class="count">{{ vehiculos().length }}</span></div>
          @for (r of vehiculos(); track r.id) { <div class="list-row"><div><strong>{{ r.placa }} · {{ r.descripcion }}</strong><small>{{ transmisiones[r.transmision] }} · {{ r.activo ? 'Activo' : 'Inactivo' }}</small></div>
            <div class="button-row"><button class="text-button" type="button" [disabled]="pendiente()" (click)="verBloqueos(r)">Bloqueos</button>
            @if (admin()) { <button class="text-button" type="button" [disabled]="pendiente()" (click)="editarVehiculo(r)">Editar</button> }</div></div>
          } @empty { <p class="empty">{{ pendiente() ? 'Cargando…' : 'Todavía no hay vehículos.' }}</p> }
        </article>
        @if (admin()) {
          <article class="card details"><h2>{{ vehiculoId ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>
            <form #d="ngForm" class="form-stack" (ngSubmit)="guardarVehiculo()">
              <label>Placa<input name="placa" [(ngModel)]="formVehiculo.placa" required pattern="[A-Za-z0-9\\-]{5,12}"></label>
              <label>Descripción<input name="descripcion" [(ngModel)]="formVehiculo.descripcion" required maxlength="140"></label>
              <label>Transmisión<select name="transmision" [(ngModel)]="formVehiculo.transmision"><option value="MECANICA">Mecánica</option><option value="AUTOMATICA">Automática</option></select></label>
              <label class="check"><input name="activo" type="checkbox" [(ngModel)]="formVehiculo.activo"> Disponible para reservas</label>
              <div class="button-row"><button class="button primary" [disabled]="d.invalid || pendiente()">Guardar vehículo</button>
                @if (vehiculoId) { <button type="button" class="button secondary" (click)="editarVehiculo()">Nuevo vehículo</button> }</div>
            </form>
          </article>
        }
      </div>
      @if (vehiculoBloqueo(); as vehiculo) {
        <article class="card details top-gap">
          <div class="card-head"><h2>Bloqueos de {{ vehiculo.placa }}</h2><button type="button" class="text-button" (click)="vehiculoBloqueo.set(null)" [disabled]="pendiente()">Cerrar</button></div>
          @for (r of bloqueos(); track r.id) { <div class="mini-row">
            <div><strong>{{ r.motivo }}</strong><small>{{ fechaVisible(r.inicio) }} {{ hora(r.inicio) }} – {{ fechaVisible(r.fin) }} {{ hora(r.fin) }}</small></div>
            @if (admin()) { <button type="button" class="text-button" [disabled]="pendiente()" (click)="quitarBloqueo(vehiculo.id, r.id)">Eliminar</button> }
          </div> } @empty { <p class="muted">Sin bloqueos registrados.</p> }
          @if (admin()) {
            <form #b="ngForm" class="form-stack top-gap" (ngSubmit)="crearBloqueo(vehiculo.id)">
              <div class="form-grid">
                <label>Inicio<input type="datetime-local" name="inicio" [(ngModel)]="bloqueoInicio" required></label>
                <label>Fin<input type="datetime-local" name="fin" [(ngModel)]="bloqueoFin" required></label>
              </div>
              <label>Motivo<input name="motivo" [(ngModel)]="bloqueoMotivo" maxlength="200" required></label>
              <button class="button primary" [disabled]="b.invalid || pendiente()">Bloquear vehículo</button>
            </form>
          }
        </article>
      }
    }
    @case ('Personal') {
      <article class="card details narrow"><h2>Crear cuenta de personal</h2>
        <form #p="ngForm" class="form-stack" (ngSubmit)="guardarPersonal()">
          <label>Rol<select name="rol" [(ngModel)]="personal.rol"><option value="INSTRUCTOR">Instructor</option><option value="RECEPCION">Recepción</option></select></label>
          <label>Nombre completo<input name="nombre" [(ngModel)]="personal.nombre" maxlength="120" required></label>
          <label>Correo electrónico<input name="email" type="email" email [(ngModel)]="personal.email" maxlength="254" required></label>
          <label>Contraseña inicial <small>Al menos 10 caracteres, una letra y un número</small>
            <input type="password" name="password" [(ngModel)]="personal.password" minlength="10" maxlength="72" required autocomplete="new-password"></label>
          <button class="button primary" [disabled]="p.invalid || pendiente()">Crear cuenta</button>
        </form>
      </article>
    }
    @case ('Auditoría') {
      <article class="card schedule"><div class="card-head"><h2>Eventos recientes</h2><button type="button" class="text-button" [disabled]="pendiente()" (click)="mostrar('Auditoría')">Actualizar</button></div>
        @for (r of eventos(); track r.id) { <div class="list-row"><div><strong>{{ r.entidad }} #{{ r.entidadId }} · {{ r.accion }}</strong><small>{{ r.detalle || (r.actorId ? 'Usuario #' + r.actorId : 'Sistema') }}</small></div><span>{{ fechaVisible(r.fecha) }} · {{ hora(r.fecha) }}</span></div>
        } @empty { <p class="empty">{{ pendiente() ? 'Cargando…' : 'Todavía no hay eventos.' }}</p> }
      </article>
    }
  }`
})
export class Gestion extends Operaciones implements OnInit {
  readonly seccion = signal<Seccion>('Horarios');
  readonly clases = signal<Clase[]>([]);
  readonly instructores = signal<Persona[]>([]);
  readonly horarios = signal<Horario[]>([]);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly bloqueos = signal<Bloqueo[]>([]);
  readonly vehiculoBloqueo = signal<Vehiculo | null>(null);
  readonly eventos = signal<Evento[]>([]);
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  readonly soles = soles;
  readonly transmisiones = transmisiones;
  claseId: number | null = null;
  vehiculoId: number | null = null;
  instructorId: number | null = null;
  formClase = claseNueva();
  formVehiculo = vehiculoNuevo();
  personal: Personal = { rol: 'INSTRUCTOR', nombre: '', email: '', password: '' };
  dia = hoy();
  horaInicio = '08:00';
  horaFin = '12:00';
  bloqueoInicio = '';
  bloqueoFin = '';
  bloqueoMotivo = '';

  ngOnInit() { this.mostrar(this.admin() ? 'Clases' : 'Horarios'); }
  admin() { return this.session.actual()?.usuario.rol === 'ADMIN'; }
  secciones(): Seccion[] { return this.admin() ? ['Clases', 'Horarios', 'Flota', 'Personal', 'Auditoría'] : ['Horarios', 'Flota']; }
  mostrar(seccion: Seccion) {
    this.seccion.set(seccion);
    void this.ejecutar(async () => {
      switch (seccion) {
        case 'Clases': await this.cargarClases(); break;
        case 'Horarios': this.instructores.set(await this.api.instructores()); break;
        case 'Flota': await this.cargarFlota(); break;
        case 'Auditoría': this.eventos.set(await this.api.auditoria()); break;
      }
    });
  }
  editarClase(clase?: Clase) {
    this.claseId = clase?.id ?? null;
    this.formClase = clase ? { nombre: clase.nombre, minutos: clase.minutos, tarifa: clase.tarifa, activo: clase.activo } : claseNueva();
  }
  guardarClase() {
    void this.ejecutar(async () => {
      await this.api.guardarClase(this.claseId, this.formClase);
      this.editarClase();
      await this.cargarClases();
      this.mensaje.set('Clase guardada.');
    });
  }
  limpiarHorarios() { this.horarios.set([]); }
  consultarHorario() { void this.ejecutar(() => this.cargarHorarios()); }
  crearHorario() {
    void this.ejecutar(async () => {
      if (!this.instructorId || !this.dia) return;
      if (this.horaInicio >= this.horaFin) throw new Error('La hora de fin debe ser posterior a la de inicio.');
      await this.api.crearHorario(this.instructorId,
        { inicio: `${this.dia}T${this.horaInicio}`, fin: `${this.dia}T${this.horaFin}` });
      await this.cargarHorarios();
      this.mensaje.set('Horario guardado.');
    });
  }
  quitarHorario(id: number) {
    void this.ejecutar(async () => {
      await this.api.quitarHorario(id);
      await this.cargarHorarios();
      this.mensaje.set('Horario eliminado.');
    });
  }
  editarVehiculo(r?: Vehiculo) {
    this.vehiculoId = r?.id ?? null;
    this.formVehiculo = r ? { placa: r.placa, descripcion: r.descripcion, transmision: r.transmision, activo: r.activo } : vehiculoNuevo();
  }
  guardarVehiculo() {
    void this.ejecutar(async () => {
      await this.api.guardarVehiculo(this.vehiculoId, this.formVehiculo);
      this.editarVehiculo();
      await this.cargarFlota();
      this.mensaje.set('Vehículo guardado.');
    });
  }
  verBloqueos(vehiculo: Vehiculo) {
    void this.ejecutar(async () => {
      await this.cargarBloqueos(vehiculo.id);
      this.vehiculoBloqueo.set(vehiculo);
    });
  }
  crearBloqueo(id: number) {
    void this.ejecutar(async () => {
      if (this.bloqueoInicio >= this.bloqueoFin) throw new Error('El fin del bloqueo debe ser posterior al inicio.');
      await this.api.crearBloqueo(id, {
        inicio: this.bloqueoInicio, fin: this.bloqueoFin, motivo: this.bloqueoMotivo.trim()
      });
      await this.cargarBloqueos(id);
      this.bloqueoMotivo = '';
      this.mensaje.set('Bloqueo guardado.');
    });
  }
  quitarBloqueo(vehiculoId: number, bloqueoId: number) {
    void this.ejecutar(async () => {
      await this.api.quitarBloqueo(bloqueoId);
      await this.cargarBloqueos(vehiculoId);
      this.mensaje.set('Bloqueo eliminado.');
    });
  }
  guardarPersonal() {
    void this.ejecutar(async () => {
      const cuenta = await this.api.crearPersonal(this.personal);
      this.personal = { rol: this.personal.rol, nombre: '', email: '', password: '' };
      this.mensaje.set(`Cuenta de ${cuenta.nombre} creada.`);
    });
  }
  private async cargarClases() { this.clases.set(await this.api.clasesAdmin()); }
  private async cargarFlota() { this.vehiculos.set(await this.api.flota()); }
  private async cargarBloqueos(id: number) { this.bloqueos.set(await this.api.bloqueos(id)); }
  private async cargarHorarios() {
    const { instructorId, dia } = this;
    if (!instructorId || !dia) return;
    const horarios = await this.api.horarios(instructorId, dia);
    if (instructorId === this.instructorId && dia === this.dia) this.horarios.set(horarios);
  }
}
