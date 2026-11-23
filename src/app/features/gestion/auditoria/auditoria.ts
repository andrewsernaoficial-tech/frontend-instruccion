import { Component, OnInit, signal } from '@angular/core';
import { Evento, Operaciones, fechaVisible, hora } from '../../../core/api';

@Component({
  selector: 'app-auditoria',
  imports: [],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class Auditoria extends Operaciones implements OnInit {
  readonly eventos = signal<Evento[]>([]);
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;

  ngOnInit() { this.actualizar(); }
  actualizar() {
    void this.ejecutar(async () => this.eventos.set(await this.api.auditoria()));
  }
}
