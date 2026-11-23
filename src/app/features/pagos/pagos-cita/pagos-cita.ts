import { Component, OnDestroy, OnInit, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cita, descargarArchivo, Medio, MetodoPago, Operaciones, Pago, medios, soles, vigente } from '../../../core/api';

@Component({
  selector: 'app-pagos-cita',
  imports: [FormsModule],
  templateUrl: './pagos-cita.html',
  styleUrl: './pagos-cita.css',
})
export class PagosCita extends Operaciones implements OnInit, OnDestroy {
  readonly cita = input.required<Cita>();
  readonly opciones = input.required<MetodoPago[]>();
  readonly pagos = input.required<Pago[]>();
  readonly ocupado = input(false);
  readonly pagoRegistrado = output<void>();
  readonly qrUrl = signal<string | null>(null);
  private qrArchivo: Blob | null = null;
  readonly archivo = signal<File | null>(null);
  medio: Medio = 'YAPE';
  operacion = '';
  readonly medios = medios;
  readonly soles = soles;
  readonly vigente = vigente;
  readonly pagoEstado: Record<Pago['estado'], string> = {
    EN_REVISION: 'En revisión', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado'
  };

  ngOnInit() { this.medio = this.opcionesPago()[0]; }
  opcionesPago(): Medio[] { return this.opciones().length ? this.opciones().map(x => x.medio) : ['YAPE', 'PLIN', 'TRANSFERENCIA']; }
  ngOnDestroy() {
    const url = this.qrUrl();
    if (url) URL.revokeObjectURL(url);
  }
  yapeTieneQr() { return this.opciones().some(x => x.medio === 'YAPE' && x.tieneQr); }
  verQr() {
    void this.ejecutar(async () => {
      this.qrArchivo = await this.api.qrYape();
      this.qrUrl.set(URL.createObjectURL(this.qrArchivo));
    });
  }
  descargarQr() {
    if (!this.qrArchivo) return;
    const extension = this.qrArchivo.type === 'image/jpeg' ? 'jpg' : 'png';
    descargarArchivo(this.qrArchivo, `qr-yape.${extension}`);
  }
  cambiarMedio(medio: Medio) {
    if (medio === 'EFECTIVO') this.archivo.set(null);
  }
  descargarPago(pago: Pago, recibo: boolean) {
    void this.ejecutar(async () => {
      if (recibo) {
        descargarArchivo(await this.api.recibo(pago.id), `recibo-${pago.id}.pdf`);
        return;
      }
      const respuesta = await this.api.documento(pago.id);
      if (!respuesta.body) throw new Error('El comprobante está vacío.');
      const extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[respuesta.body.type] || 'bin';
      descargarArchivo(respuesta.body, `comprobante-${pago.id}.${extension}`);
    });
  }
  datosMedio() { return this.opciones().find(x => x.medio === this.medio)?.datos ?? ''; }
  pagoPendiente() { return this.pagos().some(pago => pago.estado === 'EN_REVISION'); }
  elegirArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const fichero = input.files?.[0] ?? null;
    this.error.set('');
    if (fichero && fichero.size > 5 * 1024 * 1024) {
      input.value = '';
      this.archivo.set(null);
      this.error.set('El comprobante debe pesar como máximo 5 MB.');
      return;
    }
    this.archivo.set(fichero);
  }
  enviarPago() {
    void this.ejecutar(async () => {
      const archivo = this.archivo();
      const efectivo = this.medio === 'EFECTIVO';
      if (!efectivo && !archivo) return;
      await this.api.cargarComprobante(this.cita().id, efectivo ? { medio: this.medio }
        : { medio: this.medio, operacion: this.operacion.trim(), archivo: archivo ?? undefined });
      this.pagoRegistrado.emit();
      this.archivo.set(null);
      this.operacion = '';
      this.mensaje.set(efectivo ? 'Pago en efectivo pendiente de confirmación por la escuela.' : 'Comprobante enviado para revisión.');
    });
  }
}
