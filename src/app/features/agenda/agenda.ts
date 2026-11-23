import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cita, Clase, ContactoInstructor, Estado, MetodoPago, Operaciones, Pago, Persona,
  diaSiguiente, estados, fechaVisible, hora, hoy, soles, transmisiones, vigente } from '../../core/api';
import { PagosCita } from '../pagos/pagos-cita/pagos-cita';

@Component({
  selector: 'app-agenda',
  imports: [FormsModule, RouterLink, PagosCita],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda extends Operaciones implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly citas = signal<Cita[]>([]);
  readonly seleccion = signal<Cita | null>(null);
  readonly pagos = signal<Pago[]>([]);
  readonly contacto = signal<ContactoInstructor | null>(null);
  readonly instructores = signal<Persona[]>([]);
  readonly opciones = signal<MetodoPago[]>([]);
  readonly accion = signal<'cancelar' | 'reprogramar' | null>(null);
  private clases: Clase[] = [];
  desde = hoy();
  hasta = diaSiguiente(this.desde, 6);
  motivo = '';
  instructorNuevo = 0;
  inicioNuevo = '';
  readonly estados = estados;
  readonly hora = hora;
  readonly soles = soles;
  readonly fechaVisible = fechaVisible;
  readonly vigente = vigente;
  readonly transmisiones = transmisiones;

  ngOnInit() {
    void this.ejecutar(async () => {
      const [clases, instructores, opciones] = await Promise.all([
        this.api.clases(), this.api.instructores(),
        this.rol() === 'INSTRUCTOR' ? Promise.resolve([]) : this.api.mediosPago()
      ]);
      this.clases = clases;
      this.instructores.set(instructores);
      this.opciones.set(opciones);
      await this.listar();
      const id = Number(this.route.snapshot.queryParamMap.get('id'));
      if (id > 0) await this.cargar(id);
    });
  }
  rol() { return this.session.actual()?.usuario.rol; }
  clase(id: number) { return this.clases.find(x => x.id === id)?.nombre ?? `Clase #${id}`; }
  instructor(id: number) { return this.instructores().find(x => x.id === id)?.nombre ?? `Instructor #${id}`; }
  modificable(cita: Cita) {
    return vigente(cita.inicio) && (cita.estado === 'CONFIRMADA' || cita.estado === 'PENDIENTE_PAGO' && vigente(cita.vence));
  }
  recargar() { void this.ejecutar(() => this.listar()); }
  actualizarDetalle(id: number) {
    void this.ejecutar(async () => {
      const [cita, pagos] = await Promise.all([this.api.cita(id), this.api.pagos(id)]);
      if (this.seleccion()?.id !== id) return;
      this.pagos.set(pagos);
      this.seleccion.set(cita);
    });
  }
  abrir(id: number) { void this.ejecutar(() => this.cargar(id)); }
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
    const [cita, pagos, contacto] = await Promise.all([
      this.api.cita(id),
      this.rol() === 'INSTRUCTOR' ? Promise.resolve([]) : this.api.pagos(id),
      this.rol() === 'INSTRUCTOR' ? Promise.resolve(null) : this.api.contactoInstructor(id)
    ]);
    this.pagos.set(pagos);
    this.contacto.set(contacto);
    this.seleccion.set(cita);
    this.instructorNuevo = cita.instructorId;
    this.inicioNuevo = cita.inicio.slice(0, 16);
    this.accion.set(null);
    this.motivo = '';
  }
}
