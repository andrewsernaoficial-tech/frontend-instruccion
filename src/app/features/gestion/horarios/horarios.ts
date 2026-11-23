import { Component, computed, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Horario, Operaciones, Persona, diaSiguiente, fechaVisible, hora, hoy } from '../../../core/api';

const diaCorto = new Intl.DateTimeFormat('es-PE', { weekday: 'short', timeZone: 'UTC' });

@Component({
  selector: 'app-horarios',
  imports: [FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
})
export class Horarios extends Operaciones implements OnInit {
  readonly integrado = input(false);
  readonly instructores = signal<Persona[]>([]);
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  readonly hoy = hoy();
  private readonly fecha = signal(this.hoy);
  private readonly horariosPorDia = signal<Record<string, Horario[]>>({});
  readonly semana = computed(() => {
    const dia = new Date(this.dia + 'T12:00:00Z').getUTCDay();
    const lunes = diaSiguiente(this.dia, -((dia + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = diaSiguiente(lunes, i);
      return {
        fecha,
        dia: diaCorto.format(new Date(fecha + 'T12:00:00Z')),
        numero: fecha.slice(8),
        cantidad: this.horariosPorDia()[fecha]?.length ?? 0,
      };
    });
  });
  readonly horarios = computed(() => this.horariosPorDia()[this.dia] ?? []);

  instructorId: number | null = null;
  horaInicio = '08:00';
  horaFin = '12:00';
  get dia() { return this.fecha(); }
  set dia(valor: string) { this.fecha.set(valor); }

  ngOnInit() {
    void this.ejecutar(async () => {
      if (!this.instructor()) {
        const instructores = await this.api.instructores();
        this.instructores.set(instructores);
        this.instructorId = instructores[0]?.id ?? null;
      }
      await this.cargarHorarios();
    });
  }

  instructor() { return this.session.actual()?.usuario.rol === 'INSTRUCTOR'; }

  elegirInstructor(id: number) {
    this.instructorId = id;
    this.horariosPorDia.set({});
    void this.ejecutar(() => this.cargarHorarios());
  }

  seleccionarFecha(fecha: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha === this.dia) return;
    const lunes = this.semana()[0].fecha;
    this.dia = fecha;
    if (lunes === this.semana()[0].fecha) return;
    this.horariosPorDia.set({});
    void this.ejecutar(() => this.cargarHorarios());
  }

  moverSemana(cambio: number) { this.seleccionarFecha(diaSiguiente(this.dia, cambio)); }

  crearHorario() {
    void this.ejecutar(async () => {
      if (this.horaInicio >= this.horaFin) throw new Error('La hora de fin debe ser posterior a la de inicio.');
      await this.api.crearHorario({ inicio: this.dia + 'T' + this.horaInicio, fin: this.dia + 'T' + this.horaFin });
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

  private async cargarHorarios() {
    const propio = this.instructor();
    const instructorId = this.instructorId;
    if (!propio && instructorId === null) return;
    const semana = this.semana();
    const resultados = await Promise.all(semana.map(async ({ fecha }) => {
      const horarios = propio ? await this.api.misHorarios(fecha) : await this.api.horarios(instructorId!, fecha);
      return [fecha, horarios.slice().sort((a, b) => a.inicio.localeCompare(b.inicio))] as const;
    }));
    this.horariosPorDia.set(Object.fromEntries(resultados));
  }
}
