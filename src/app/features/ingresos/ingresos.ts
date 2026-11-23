import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Operaciones, diaSiguiente, fechaVisible, hoy, medios, soles } from '../../core/api';
import type { Ingresos as Reporte } from '../../core/contrato-api';

@Component({
  selector: 'app-ingresos',
  imports: [FormsModule, RouterLink],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css',
})
export class Ingresos extends Operaciones implements OnInit {
  readonly reporte = signal<Reporte | null>(null);
  readonly soles = soles;
  readonly fechaVisible = fechaVisible;
  readonly medios = medios;
  hasta = hoy();
  desde = diaSiguiente(this.hasta, -29);

  readonly serie = computed(() => {
    const dias = this.reporte()?.dias ?? [];
    if (dias.length <= 31) return dias.map(dia => ({ etiqueta: dia.fecha.slice(5), monto: dia.monto }));
    const meses = new Map<string, number>();
    for (const dia of dias) {
      const mes = dia.fecha.slice(0, 7);
      meses.set(mes, (meses.get(mes) ?? 0) + dia.monto);
    }
    return [...meses.entries()].map(([etiqueta, monto]) => ({ etiqueta, monto }));
  });

  readonly maximo = computed(() => Math.max(1, ...this.serie().map(punto => punto.monto)));

  ngOnInit() { this.consultar(); }

  consultar() {
    void this.ejecutar(async () => {
      this.reporte.set(await this.api.ingresos(this.desde, this.hasta));
    });
  }
}
