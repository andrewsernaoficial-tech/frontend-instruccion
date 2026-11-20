import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cita, Clase, Operaciones, Persona, Transmision, Turno, fechaVisible, hora, hoy, soles } from './api';

@Component({
  selector: 'app-reserva', imports: [FormsModule, RouterLink],
  template: `
  <div class="page-head"><div><h1>Nueva reserva</h1><p>Elige una clase, consulta la disponibilidad y selecciona tu horario.</p></div>
    <a routerLink="/agenda" class="button secondary">Volver a la agenda</a>
  </div>
  @if (error()) { <div class="feedback error" role="alert">{{ error() }}</div> }
  <div class="split">
    <article class="card details">
      <h2>Datos de la reserva</h2>
      @if (!clases().length || !instructores().length) {
        <p class="notice">{{ pendiente() ? 'Cargando clases e instructores…' : 'Todavía faltan clases o instructores activos. Pide a administración que los configure.' }}</p>
      }
      <form #f="ngForm" (ngSubmit)="buscarTurnos()" class="form-stack">
        @if (esPersonal()) {
          <label>Correo o teléfono del alumno<input name="contacto" [(ngModel)]="contacto" (ngModelChange)="alumno.set(null)" required></label>
          <button type="button" class="button secondary" [disabled]="!contacto.trim() || pendiente()" (click)="buscarAlumno()">Buscar alumno</button>
          @if (alumno(); as a) { <p class="notice">Alumno seleccionado: <strong>{{ a.nombre }}</strong></p> }
          <label>Canal<select name="canal" [(ngModel)]="canal">
            <option value="PRESENCIAL">Presencial</option><option>WHATSAPP</option><option value="LLAMADA">Llamada</option>
            <option value="FACEBOOK">Facebook</option><option value="WEB">Web</option>
          </select></label>
        }
        <label>Tipo de clase<select name="clase" [(ngModel)]="claseId" (ngModelChange)="limpiarTurnos()" required>
          <option [ngValue]="null" disabled>Selecciona una clase</option>
          @for (clase of clases(); track clase.id) { <option [ngValue]="clase.id">{{ clase.nombre }} · {{ clase.minutos }} min</option> }
        </select></label>
        <label>Instructor<select name="instructor" [(ngModel)]="instructorId" (ngModelChange)="limpiarTurnos()" required>
          <option [ngValue]="null" disabled>Selecciona un instructor</option>
          @for (profesor of instructores(); track profesor.id) { <option [ngValue]="profesor.id">{{ profesor.nombre }}</option> }
        </select></label>
        <div class="form-grid">
          <label>Fecha<input type="date" name="fecha" [(ngModel)]="fecha" [min]="hoy()" required (ngModelChange)="limpiarTurnos()"></label>
          <label>Transmisión<select name="transmision" [(ngModel)]="transmision" (ngModelChange)="limpiarTurnos()">
            <option value="MECANICA">Mecánica</option><option value="AUTOMATICA">Automática</option>
          </select></label>
        </div>
        <label class="check"><input type="checkbox" name="vehiculo" [(ngModel)]="vehiculoPropio" (ngModelChange)="limpiarTurnos()"> Usaré un vehículo propio</label>
        @if (vehiculoPropio) {
          <div class="form-grid">
            <label>Placa<input name="placa" [(ngModel)]="placa" required pattern="[A-Za-z0-9\\-]{5,12}"></label>
            <label>Marca<input name="marca" [(ngModel)]="marca" required maxlength="70"></label>
            <label>Modelo<input name="modelo" [(ngModel)]="modelo" required maxlength="70"></label>
          </div>
        }
        <button type="submit" class="button secondary" [disabled]="f.invalid || pendiente() || (esPersonal() && !alumno())">Consultar horarios</button>
        <section aria-label="Horarios disponibles">
          @if (consultado()) {
            <h3>Horarios disponibles</h3>
            <div class="slots">
              @for (turno of turnos(); track turno.inicio) {
                <button type="button" class="slot" [class.chosen]="elegido() === turno.inicio"
                  [attr.aria-pressed]="elegido() === turno.inicio" (click)="elegido.set(turno.inicio)">{{ hora(turno.inicio) }}</button>
              } @empty { <p class="muted">No quedan horarios para esta selección. Prueba con otro día o instructor.</p> }
            </div>
          }
        </section>
        <button type="button" class="button primary" [disabled]="!elegido() || f.invalid || pendiente() || (esPersonal() && !alumno())" (click)="reservar()">Confirmar reserva</button>
      </form>
    </article>
    <aside class="card details booking-summary">
      <span class="stat-icon orange" aria-hidden="true">▤</span>
      <h2>Tu clase</h2>
      <dl class="facts">
        <div><dt>Clase</dt><dd>{{ claseElegida()?.nombre || 'Por seleccionar' }}</dd></div>
        <div><dt>Fecha</dt><dd>{{ fecha ? fechaVisible(fecha, true) : 'Por seleccionar' }}</dd></div>
        <div><dt>Hora de Lima</dt><dd>{{ elegido() ? hora(elegido()) : 'Por seleccionar' }}</dd></div>
        <div><dt>Vehículo</dt><dd>{{ vehiculoPropio ? 'Vehículo propio' : 'Flota de la escuela' }}</dd></div>
      </dl>
      <div class="total"><span>Importe</span><strong>{{ claseElegida() ? soles(claseElegida()!.tarifa) : '—' }}</strong></div>
      <p class="muted">Después de reservar podrás adjuntar tu comprobante en la agenda.</p>
    </aside>
  </div>`
})
export class Reserva extends Operaciones implements OnInit {
  private readonly router = inject(Router);
  readonly clases = signal<Clase[]>([]);
  readonly instructores = signal<Persona[]>([]);
  readonly alumno = signal<Persona | null>(null);
  readonly turnos = signal<Turno[]>([]);
  readonly elegido = signal('');
  readonly consultado = signal(false);
  readonly hoy = hoy;
  readonly hora = hora;
  readonly fechaVisible = fechaVisible;
  readonly soles = soles;
  claseId: number | null = null;
  instructorId: number | null = null;
  transmision: Transmision = 'MECANICA';
  fecha = hoy();
  vehiculoPropio = false;
  canal = 'PRESENCIAL';
  contacto = '';
  placa = '';
  marca = '';
  modelo = '';

  ngOnInit() {
    void this.ejecutar(async () => {
      const [clases, instructores] = await Promise.all([
        this.api.get<Clase[]>('/tipos-clase'), this.api.get<Persona[]>('/instructores')
      ]);
      this.clases.set(clases);
      this.instructores.set(instructores);
    });
  }
  esPersonal() { return this.session.actual()?.usuario.rol !== 'CLIENTE'; }
  claseElegida() { return this.clases().find(c => c.id === this.claseId); }
  limpiarTurnos() {
    this.turnos.set([]);
    this.elegido.set('');
    this.consultado.set(false);
  }
  buscarAlumno() {
    void this.ejecutar(async () => {
      const contacto = this.contacto.trim();
      const alumno = await this.api.get<Persona>('/admin/clientes/busqueda', { contacto });
      if (contacto === this.contacto.trim()) this.alumno.set(alumno);
    });
  }
  buscarTurnos() {
    void this.ejecutar(async () => {
      if (this.claseId === null || this.instructorId === null) return;
      this.limpiarTurnos();
      const { instructorId, claseId: tipoClaseId, fecha, transmision, vehiculoPropio } = this;
      const turnos = await this.api.get<Turno[]>('/disponibilidad', { instructorId, tipoClaseId, fecha, transmision, vehiculoPropio });
      if (instructorId !== this.instructorId || tipoClaseId !== this.claseId || fecha !== this.fecha ||
          transmision !== this.transmision || vehiculoPropio !== this.vehiculoPropio) return;
      this.turnos.set(turnos);
      this.consultado.set(true);
    });
  }
  reservar() {
    void this.ejecutar(async () => {
      const cita = await this.api.post<Cita>('/citas', {
        alumnoId: this.alumno()?.id ?? null, instructorId: this.instructorId, tipoClaseId: this.claseId,
        inicio: this.elegido(), transmision: this.transmision, vehiculoPropio: this.vehiculoPropio,
        canal: this.esPersonal() ? this.canal : 'WEB',
        ...(this.vehiculoPropio ? { placaPropia: this.placa.trim(), marcaPropia: this.marca.trim(), modeloPropio: this.modelo.trim() } : {})
      });
      await this.router.navigate(['/agenda'], { queryParams: { id: cita.id } });
    });
  }
}
