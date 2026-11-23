import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Operaciones, diaSiguiente, fechaVisible, hoy, medios, soles } from '../../core/api';
import type { Ingresos as Reporte } from '../../core/contrato-api';

type Periodo = 'semana' | 'mes' | 'ultimos30';
interface PuntoIngreso { etiqueta: string; monto: number; }

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
  readonly periodo = signal<Periodo | null>('ultimos30');
  readonly periodoConsultado = signal<{ desde: string; hasta: string } | null>(null);
  readonly puntoActivo = signal<string | null>(null);
  readonly periodos: { id: Periodo; nombre: string }[] = [
    { id: 'semana', nombre: 'Últimos 7 días' },
    { id: 'ultimos30', nombre: 'Últimos 30 días' },
    { id: 'mes', nombre: 'Este mes' },
  ];
  hasta = hoy();
  desde = diaSiguiente(this.hasta, -29);

  readonly serie = computed<PuntoIngreso[]>(() => {
    const dias = this.reporte()?.dias ?? [];
    if (dias.length <= 31) return dias.map(dia => ({ etiqueta: dia.fecha.slice(8) + '/' + dia.fecha.slice(5, 7), monto: dia.monto }));
    const meses = new Map<string, number>();
    for (const dia of dias) {
      const mes = dia.fecha.slice(0, 7);
      meses.set(mes, (meses.get(mes) ?? 0) + dia.monto);
    }
    return [...meses.entries()].map(([mes, monto]) => ({ etiqueta: mes.slice(5) + '/' + mes.slice(0, 4), monto }));
  });

  readonly maximo = computed(() => Math.max(0, ...this.serie().map(punto => punto.monto)) || 1);
  readonly detalle = computed(() => this.serie().find(punto => punto.etiqueta === this.puntoActivo())
    ?? this.serie().reduce<PuntoIngreso | null>(
      (mayor, punto) => !mayor || punto.monto >= mayor.monto ? punto : mayor, null));
  readonly promedio = computed(() => {
    const datos = this.reporte();
    return datos?.pagos ? datos.total / datos.pagos : 0;
  });
  readonly desglose = computed(() => (this.reporte()?.medios ?? []).slice().sort((a, b) => b.monto - a.monto));

  ngOnInit() { this.consultar(); }

  seleccionarPeriodo(periodo: Periodo) {
    const hasta = hoy();
    this.hasta = hasta;
    this.desde = periodo === 'mes' ? hasta.slice(0, 8) + '01' : diaSiguiente(hasta, periodo === 'semana' ? -6 : -29);
    this.periodo.set(periodo);
    this.consultar();
  }

  consultar() {
    void this.ejecutar(async () => {
      const { desde, hasta } = this;
      if (!desde || !hasta || hasta < desde) throw new Error('Selecciona un rango de fechas válido.');
      const datos = await this.api.ingresos(desde, hasta);
      this.reporte.set(datos);
      this.periodoConsultado.set({ desde, hasta });
      this.puntoActivo.set(null);
    });
  }
}
