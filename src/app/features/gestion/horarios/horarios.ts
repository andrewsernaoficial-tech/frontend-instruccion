import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Horario, Operaciones, Persona, fechaVisible, hora, hoy } from '../../../core/api';

@Component({
  selector: 'app-horarios',
  imports: [FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
})
export class Horarios extends Operaciones implements OnInit {
  readonly instructores = signal<Persona[]>([]);
  readonly horarios = signal<Horario[]>([]);
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  instructorId: number | null = null;
  dia = hoy();
  horaInicio = '08:00';
  horaFin = '12:00';

  ngOnInit() {
    void this.ejecutar(async () => {
      if (this.instructor()) await this.cargarHorarios();
      else this.instructores.set(await this.api.instructores());
    });
  }
  instructor() { return this.session.actual()?.usuario.rol === 'INSTRUCTOR'; }
  limpiarHorarios() { this.horarios.set([]); }
  consultarHorario() { void this.ejecutar(() => this.cargarHorarios()); }
  crearHorario() {
    void this.ejecutar(async () => {
      if (!this.dia) return;
      if (this.horaInicio >= this.horaFin) throw new Error('La hora de fin debe ser posterior a la de inicio.');
      await this.api.crearHorario({ inicio: `${this.dia}T${this.horaInicio}`, fin: `${this.dia}T${this.horaFin}` });
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
    const { instructorId, dia } = this;
    if (!dia) return;
    if (this.instructor()) {
      const horarios = await this.api.misHorarios(dia);
      if (dia === this.dia) this.horarios.set(horarios);
      return;
    }
    if (!instructorId) return;
    const horarios = await this.api.horarios(instructorId, dia);
    if (instructorId === this.instructorId && dia === this.dia) this.horarios.set(horarios);
  }
}
