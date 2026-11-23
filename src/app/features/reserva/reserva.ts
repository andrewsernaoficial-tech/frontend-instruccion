import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Canal, Clase, Operaciones, Persona, Transmision, Turno, fechaVisible, hora, hoy, soles } from '../../core/api';

@Component({
  selector: 'app-reserva', imports: [FormsModule, RouterLink],
  templateUrl: './reserva.html',
  styleUrl: './reserva.css',
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
  canal: Canal = 'PRESENCIAL';
  contacto = '';
  placa = '';
  marca = '';
  modelo = '';

  ngOnInit() {
    void this.ejecutar(async () => {
      const [clases, instructores] = await Promise.all([
        this.api.clases(), this.api.instructores()
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
      const alumno = await this.api.buscarCliente(contacto);
      if (contacto === this.contacto.trim()) this.alumno.set(alumno);
    });
  }
  buscarTurnos() {
    void this.ejecutar(async () => {
      if (this.claseId === null || this.instructorId === null) return;
      this.limpiarTurnos();
      const { instructorId, claseId: tipoClaseId, fecha, transmision, vehiculoPropio } = this;
      const turnos = await this.api.disponibilidad({ instructorId, tipoClaseId, fecha, transmision, vehiculoPropio });
      if (instructorId !== this.instructorId || tipoClaseId !== this.claseId || fecha !== this.fecha ||
          transmision !== this.transmision || vehiculoPropio !== this.vehiculoPropio) return;
      this.turnos.set(turnos);
      this.consultado.set(true);
    });
  }
  reservar() {
    void this.ejecutar(async () => {
      const { instructorId, claseId: tipoClaseId } = this;
      const inicio = this.elegido();
      const alumnoId = this.esPersonal() ? this.alumno()?.id ?? null : null;
      if (instructorId === null || tipoClaseId === null || !inicio || (this.esPersonal() && alumnoId === null)) return;
      const cita = await this.api.reservar({
        alumnoId, instructorId, tipoClaseId,
        inicio, transmision: this.transmision, vehiculoPropio: this.vehiculoPropio,
        canal: this.esPersonal() ? this.canal : 'WEB',
        ...(this.vehiculoPropio ? { placaPropia: this.placa.trim(), marcaPropia: this.marca.trim(), modeloPropio: this.modelo.trim() } : {})
      });
      await this.router.navigate(['/agenda'], { queryParams: { id: cita.id } });
    });
  }
}
