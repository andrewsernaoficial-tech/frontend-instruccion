import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cita, Clase, Estado, Medio, MetodoPago, Operaciones, Pago, Persona, diaSiguiente, estados,
  fechaVisible, hora, hoy, medios, soles, transmisiones, vigente } from './api';

@Component({
  selector: 'app-resumen', imports: [RouterLink],
  template: `
  <section class="welcome">
    <div><p class="welcome-date">{{ fechaVisible(hoy(), true) }}</p>
      <h1>Hola, {{ nombre() }}.</h1>
      <p>Revisa tus clases y organiza los próximos días.</p>
      <a class="button primary" routerLink="/agenda">Ver agenda <span aria-hidden="true">↗</span></a>
    </div>
    <div class="welcome-art" aria-hidden="true"><span></span><span></span><span></span></div>
  </section>
  @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
  <div class="overview-header"><h2>Próximos 7 días</h2>
    @if (session.actual()?.usuario?.rol !== 'INSTRUCTOR') { <a class="button primary" routerLink="/reservar">+ Nueva reserva</a> }
  </div>
  <div class="stats">
    <article class="card stat"><span class="stat-icon yellow" aria-hidden="true">▤</span><span>Citas programadas</span><strong>{{ citas().length }}</strong></article>
    <article class="card stat"><span class="stat-icon green" aria-hidden="true">✓</span><span>Confirmadas</span><strong>{{ contar('CONFIRMADA') }}</strong></article>
    <article class="card stat"><span class="stat-icon gold" aria-hidden="true">◷</span><span>Pendientes de pago</span><strong>{{ contar('PENDIENTE_PAGO') }}</strong></article>
  </div>
  <article class="card schedule">
    <div class="card-head"><h2>Próximas clases</h2><a routerLink="/agenda" class="text-button">Ver todas →</a></div>
    @if (pendiente()) { <p class="empty">Cargando la agenda…</p> }
    @else {
      @for (cita of citas().slice(0, 5); track cita.id) {
        <a class="schedule-row" routerLink="/agenda" [queryParams]="{ id: cita.id }">
          <span class="tile-time">{{ hora(cita.inicio) }}</span>
          <span><strong>{{ clase(cita.tipoClaseId) }}</strong><small>{{ fechaVisible(cita.inicio) }} · {{ instructor(cita.instructorId) }}</small></span>
          <span class="badge" [attr.data-state]="cita.estado">{{ estados[cita.estado] }}</span>
        </a>
      } @empty { <p class="empty">Aún no hay clases en este periodo.</p> }
    }
  </article>`
})
export class Resumen extends Operaciones implements OnInit {
  readonly citas = signal<Cita[]>([]);
  private clases: Clase[] = [];
  private instructores: Persona[] = [];
  readonly hoy = hoy;
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  readonly estados = estados;

  ngOnInit() {
    void this.ejecutar(async () => {
      const desde = hoy();
      const [citas, clases, instructores] = await Promise.all([
        this.api.citas(desde, diaSiguiente(desde, 6)),
        this.api.clases(), this.api.instructores()
      ]);
      this.clases = clases;
      this.instructores = instructores;
      this.citas.set(citas.filter(cita => cita.estado !== 'CANCELADA' && cita.estado !== 'VENCIDA'));
    });
  }
  nombre() { return this.session.actual()?.usuario.nombre.trim().split(/\s+/)[0]; }
  contar(estado: Estado) { return this.citas().filter(cita => cita.estado === estado).length; }
  clase(id: number) { return this.clases.find(item => item.id === id)?.nombre ?? `Clase #${id}`; }
  instructor(id: number) { return this.instructores.find(item => item.id === id)?.nombre ?? `Instructor #${id}`; }
}

@Component({
  selector: 'app-agenda', imports: [FormsModule, RouterLink],
  template: `
  <div class="page-head"><div><h1>Agenda</h1><p>Consulta tus clases, cambios y comprobantes.</p></div>
    @if (rol() !== 'INSTRUCTOR') { <a class="button primary" routerLink="/reservar">+ Nueva reserva</a> }
  </div>
  @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
  @if (mensaje()) { <div class="feedback good" role="status">{{ mensaje() }}</div> }
  <form class="card filter-bar" #f="ngForm" (ngSubmit)="recargar()">
    <label>Desde<input type="date" name="desde" [(ngModel)]="desde" required></label>
    <label>Hasta<input type="date" name="hasta" [(ngModel)]="hasta" [min]="desde" required></label>
    <button class="button secondary" [disabled]="f.invalid || pendiente()">Consultar agenda</button>
  </form>
  <div class="agenda-grid" [class.has-detail]="seleccion()">
    <article class="card schedule">
      <div class="card-head"><h2>Clases programadas</h2><span class="count">{{ citas().length }}</span></div>
      @for (cita of citas(); track cita.id) {
        <button class="schedule-row" type="button" [class.selected]="seleccion()?.id === cita.id" (click)="abrir(cita.id)" [disabled]="pendiente()">
          <span class="tile-time">{{ hora(cita.inicio) }}</span>
          <span><strong>{{ clase(cita.tipoClaseId) }}</strong><small>{{ fechaVisible(cita.inicio) }} · {{ instructor(cita.instructorId) }}</small></span>
          <span class="badge" [attr.data-state]="cita.estado">{{ estados[cita.estado] }}</span>
        </button>
      } @empty { <p class="empty">{{ pendiente() ? 'Cargando la agenda…' : 'No hay citas en el periodo seleccionado.' }}</p> }
    </article>
    @if (seleccion(); as cita) {
      <article class="card details">
        <div class="card-head"><h2>Cita #{{ cita.id }}</h2><button class="text-button" type="button" (click)="seleccion.set(null)" [disabled]="pendiente()">Cerrar</button></div>
        <span class="badge" [attr.data-state]="cita.estado">{{ estados[cita.estado] }}</span>
        <dl class="facts">
          <div><dt>Clase</dt><dd>{{ clase(cita.tipoClaseId) }}</dd></div>
          <div><dt>Instructor</dt><dd>{{ instructor(cita.instructorId) }}</dd></div>
          <div><dt>Fecha y hora</dt><dd>{{ fechaVisible(cita.inicio, true) }} · {{ hora(cita.inicio) }}–{{ hora(cita.fin) }}</dd></div>
          <div><dt>Vehículo</dt><dd>@if (cita.placaPropia) { {{ cita.placaPropia }} · {{ cita.marcaPropia }} {{ cita.modeloPropio }} }
            @else { Flota de la escuela }
            · {{ transmisiones[cita.transmision] }}</dd></div>
          <div><dt>Importe</dt><dd>{{ soles(cita.monto) }}</dd></div>
          @if (cita.estado === 'PENDIENTE_PAGO') { <div><dt>Vence</dt><dd>{{ fechaVisible(cita.vence) }} a las {{ hora(cita.vence) }}</dd></div> }
          @if (cita.motivo) { <div><dt>Motivo</dt><dd>{{ cita.motivo }}</dd></div> }
        </dl>
        @if (rol() !== 'INSTRUCTOR') {
          <h3>Comprobantes</h3>
          @for (pago of pagos(); track pago.id) {
            <div class="mini-row"><div><strong>{{ medios[pago.medio] }} · {{ pago.operacion }}</strong>
              <small>{{ pago.motivo || soles(pago.monto) }}</small></div><span class="badge" [attr.data-state]="pago.estado">{{ pagoEstado[pago.estado] }}</span></div>
          } @empty { <p class="muted">Aún no hay comprobantes para esta cita.</p> }
          @if (cita.estado === 'PENDIENTE_PAGO' && vigente(cita.vence) && !pagoPendiente()) {
            <form #p="ngForm" (ngSubmit)="enviarPago(cita.id)" class="form-stack top-gap">
              <label>Medio de pago<select name="medio" [(ngModel)]="medio" required>
                @for (op of opcionesPago(); track op) { <option [ngValue]="op">{{ medios[op] }}</option> }
              </select></label>
              @if (datosMedio()) { <p class="notice">{{ datosMedio() }}</p> }
              <label>Número de operación<input name="operacion" [(ngModel)]="operacion" required maxlength="60" pattern="[A-Za-z0-9._\\/\\-]+"></label>
              <label>Comprobante <small>JPG, PNG o PDF · hasta 5 MB</small><input type="file" accept="image/jpeg,image/png,application/pdf" (change)="elegirArchivo($event)"></label>
              <button class="button primary" [disabled]="p.invalid || !archivo() || pendiente()">Enviar comprobante</button>
            </form>
          }
        }
        @if (rol() !== 'INSTRUCTOR' && modificable(cita)) {
          <div class="button-row top-gap">
            <button type="button" class="button secondary" (click)="accion.set('reprogramar')">Reprogramar</button>
            <button type="button" class="button danger" (click)="accion.set('cancelar')">Cancelar cita</button>
          </div>
          @if (accion() === 'reprogramar') {
            <form class="form-stack top-gap" #r="ngForm" (ngSubmit)="reprogramar(cita.id)">
              <label>Instructor<select name="instructorNuevo" [(ngModel)]="instructorNuevo" required>
                @for (profesor of instructores(); track profesor.id) { <option [ngValue]="profesor.id">{{ profesor.nombre }}</option> }
              </select></label>
              <label>Nuevo inicio <small>Hora de Lima, en intervalos de 15 minutos</small><input type="datetime-local" name="inicioNuevo" [(ngModel)]="inicioNuevo" step="900" required></label>
              <button class="button primary" [disabled]="r.invalid || pendiente()">Guardar cambio</button>
            </form>
          } @else if (accion() === 'cancelar') {
            <form class="form-stack top-gap" #c="ngForm" (ngSubmit)="cambiar(cita.id, 'CANCELADA', motivo)">
              <label>Motivo de cancelación<input name="motivo" [(ngModel)]="motivo" maxlength="240" required></label>
              <button class="button danger" [disabled]="c.invalid || !motivo.trim() || pendiente()">Confirmar cancelación</button>
            </form>
          }
        }
        @if (rol() !== 'CLIENTE') {
          @if (cita.estado === 'CONFIRMADA' && !vigente(cita.inicio)) {
            <div class="button-row top-gap"><button class="button primary" [disabled]="pendiente()" (click)="cambiar(cita.id, 'EN_CURSO')">Iniciar clase</button>
              <button class="button secondary" [disabled]="pendiente()" (click)="cambiar(cita.id, 'NO_ASISTIO')">Marcar inasistencia</button></div>
          } @else if (cita.estado === 'EN_CURSO') {
            <button class="button primary top-gap" [disabled]="pendiente()" (click)="cambiar(cita.id, 'COMPLETADA')">Completar clase</button>
          }
        }
      </article>
    }
  </div>`
})
export class Agenda extends Operaciones implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly citas = signal<Cita[]>([]);
  readonly seleccion = signal<Cita | null>(null);
  readonly pagos = signal<Pago[]>([]);
  readonly instructores = signal<Persona[]>([]);
  readonly opciones = signal<MetodoPago[]>([]);
  readonly archivo = signal<File | null>(null);
  readonly accion = signal<'cancelar' | 'reprogramar' | null>(null);
  private clases: Clase[] = [];
  desde = hoy();
  hasta = diaSiguiente(this.desde, 6);
  medio: Medio = 'YAPE';
  operacion = '';
  motivo = '';
  instructorNuevo = 0;
  inicioNuevo = '';
  readonly estados = estados;
  readonly medios = medios;
  readonly hora = hora;
  readonly soles = soles;
  readonly fechaVisible = fechaVisible;
  readonly vigente = vigente;
  readonly transmisiones = transmisiones;
  readonly pagoEstado: Record<Pago['estado'], string> = { EN_REVISION: 'En revisión', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado' };

  ngOnInit() {
    void this.ejecutar(async () => {
      const [clases, instructores, opciones] = await Promise.all([
        this.api.clases(), this.api.instructores(),
        this.rol() === 'INSTRUCTOR' ? Promise.resolve([]) : this.api.mediosPago()
      ]);
      this.clases = clases;
      this.instructores.set(instructores);
      this.opciones.set(opciones);
      this.medio = this.opcionesPago()[0];
      await this.listar();
      const id = Number(this.route.snapshot.queryParamMap.get('id'));
      if (id > 0) await this.cargar(id);
    });
  }
  rol() { return this.session.actual()?.usuario.rol; }
  clase(id: number) { return this.clases.find(x => x.id === id)?.nombre ?? `Clase #${id}`; }
  instructor(id: number) { return this.instructores().find(x => x.id === id)?.nombre ?? `Instructor #${id}`; }
  opcionesPago(): Medio[] { return this.opciones().length ? this.opciones().map(x => x.medio) : ['YAPE', 'PLIN', 'TRANSFERENCIA']; }
  datosMedio() { return this.opciones().find(x => x.medio === this.medio)?.datos ?? ''; }
  pagoPendiente() { return this.pagos().some(pago => pago.estado === 'EN_REVISION'); }
  modificable(cita: Cita) {
    return vigente(cita.inicio) && (cita.estado === 'CONFIRMADA' || cita.estado === 'PENDIENTE_PAGO' && vigente(cita.vence));
  }
  elegirArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const fichero = input.files?.[0] ?? null;
    this.error.set('');
    if (fichero && fichero.size > 5 * 1024 * 1024) {
      input.value = '';
      this.archivo.set(null);
      this.error.set('El comprobante debe pesar como máximo 5 MB.');
      return;
    }
    this.archivo.set(fichero);
  }
  recargar() { void this.ejecutar(() => this.listar()); }
  abrir(id: number) { void this.ejecutar(() => this.cargar(id)); }
  enviarPago(id: number) {
    void this.ejecutar(async () => {
      const archivo = this.archivo();
      if (!archivo) return;
      await this.api.cargarComprobante(id, { medio: this.medio, operacion: this.operacion.trim(), archivo });
      await this.cargar(id);
      this.mensaje.set('Comprobante enviado para revisión.');
    });
  }
  cambiar(id: number, estado: Estado, motivo?: string) {
    void this.ejecutar(async () => {
      await this.api.cambiarEstado(id, { estado, motivo });
      await Promise.all([this.listar(), this.cargar(id)]);
      this.mensaje.set('Estado de la cita actualizado.');
    });
  }
  reprogramar(id: number) {
    void this.ejecutar(async () => {
      await this.api.reprogramar(id, { instructorId: this.instructorNuevo, inicio: this.inicioNuevo });
      await Promise.all([this.listar(), this.cargar(id)]);
      this.mensaje.set('Cita reprogramada.');
    });
  }
  private async listar() {
    this.citas.set(await this.api.citas(this.desde, this.hasta));
  }
  private async cargar(id: number) {
    const [cita, pagos] = await Promise.all([
      this.api.cita(id),
      this.rol() === 'INSTRUCTOR' ? Promise.resolve([]) : this.api.pagos(id)
    ]);
    this.pagos.set(pagos);
    this.seleccion.set(cita);
    this.instructorNuevo = cita.instructorId;
    this.inicioNuevo = cita.inicio.slice(0, 16);
    this.accion.set(null);
    this.archivo.set(null);
    this.motivo = '';
    this.operacion = '';
  }
}
