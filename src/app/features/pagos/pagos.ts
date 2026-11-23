import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Operaciones, Pago, descargarArchivo, fechaVisible, hora, medios, soles } from '../../core/api';

@Component({
  selector: 'app-pagos', imports: [FormsModule, RouterLink],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos extends Operaciones implements OnInit {
  readonly pagos = signal<Pago[]>([]);
  readonly seleccion = signal<Pago | null>(null);
  readonly medios = medios;
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  readonly soles = soles;
  motivo = '';
  ngOnInit() { this.actualizar(); }
  actualizar() { void this.ejecutar(() => this.cargar()); }
  seleccionar(pago: Pago) { this.seleccion.set(pago); this.motivo = ''; }
  resolver(id: number, aprobar: boolean) {
    void this.ejecutar(async () => {
      await this.api.revisarPago(id, { aprobar, motivo: aprobar ? null : this.motivo.trim() });
      this.seleccion.set(null);
      await this.cargar();
      this.mensaje.set(aprobar ? 'Pago aprobado y cita confirmada.' : 'Pago rechazado.');
    });
  }
  descargar(id: number) {
    void this.ejecutar(async () => {
      const result = await this.api.documento(id);
      if (!result.body) throw new Error('El comprobante está vacío.');
      const extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[result.body.type] || 'bin';
      descargarArchivo(result.body, `comprobante-${id}.${extension}`);
    });
  }
  private async cargar() {
    const lista = await this.api.pendientesPago();
    this.pagos.set(lista);
    if (!lista.some(p => p.id === this.seleccion()?.id)) this.seleccion.set(null);
  }
}
