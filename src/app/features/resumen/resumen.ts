import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cita, Clase, Estado, Operaciones, Persona, diaSiguiente, estados, fechaVisible, hora, hoy } from '../../core/api';

@Component({
  selector: 'app-resumen', imports: [RouterLink],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css',
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
