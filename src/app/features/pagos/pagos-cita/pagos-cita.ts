import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cita, descargarArchivo, Medio, MetodoPago, Operaciones, Pago, medios, soles, vigente } from '../../../core/api';

@Component({
  selector: 'app-pagos-cita',
  imports: [FormsModule],
  templateUrl: './pagos-cita.html',
  styleUrl: './pagos-cita.css',
})
export class PagosCita extends Operaciones implements OnInit {
  readonly cita = input.required<Cita>();
  readonly opciones = input.required<MetodoPago[]>();
  readonly pagos = input.required<Pago[]>();
  readonly ocupado = input(false);
  readonly pagoRegistrado = output<void>();
  readonly archivo = signal<File | null>(null);
  readonly enlacePrueba = signal<string | null>(null);
  medio: Medio = 'PLIN';
  operacion = '';
  readonly medios = medios;
  readonly soles = soles;
  readonly vigente = vigente;
  readonly pagoEstado: Record<Pago['estado'], string> = {
    EN_REVISION: 'En revisión', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado'
  };

  ngOnInit() { this.medio = this.opcionesPago()[0]; }
  opcionesPago(): Medio[] {
    const alumno = this.session.actual()?.usuario.rol === 'CLIENTE';
    const mediosDisponibles = this.opciones().map(opcion => opcion.medio)
      .filter(medio => medio !== 'YAPE' && (medio !== 'MERCADO_PAGO' || alumno));
    return mediosDisponibles.length ? mediosDisponibles : ['PLIN', 'TRANSFERENCIA'];
  }
  requiereArchivo() { return this.medio !== 'EFECTIVO' && this.medio !== 'MERCADO_PAGO'; }
  mercadoPagoPrueba() {
    return this.session.actual()?.usuario.rol === 'CLIENTE'
      && this.opciones().some(opcion => opcion.medio === 'MERCADO_PAGO' && opcion.modoPrueba);
  }
  enviarCorreo(pago: Pago) {
    void this.ejecutar(async () => {
      const resultado = await this.api.enviarReciboCorreo(pago.id);
      this.mensaje.set(resultado.estado === 'ENVIADO' ? 'El recibo ya se envió al correo del alumno.'
        : 'El recibo está en cola para enviarse al correo del alumno.');
    });
  }
  cambiarMedio(medio: Medio) {
    if (medio === 'EFECTIVO' || medio === 'MERCADO_PAGO') this.archivo.set(null);
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
  verificarPago() {
    void this.ejecutar(async () => {
      const resultado = await this.api.verificarCheckout(this.cita().id);
      switch (resultado.estado) {
        case 'ACREDITADO':
          this.enlacePrueba.set(null);
          this.mensaje.set('Pago de prueba aprobado. La reserva está confirmada.');
          this.pagoRegistrado.emit();
          break;
        case 'CERRADO':
          this.enlacePrueba.set(null);
          this.error.set('La orden de prueba se cerró sin acreditar el pago.');
          break;
        case 'INCIDENCIA':
          this.enlacePrueba.set(null);
          this.error.set(resultado.incidencia ?? 'La orden de prueba requiere revisión.');
          break;
        default:
          this.mensaje.set('Mercado Pago aún no ha acreditado el pago de prueba.');
      }
    });
  }
  enviarPago() {
    void this.ejecutar(async () => {
      if (this.medio === 'MERCADO_PAGO') {
        const { enlace } = await this.api.iniciarCheckout(this.cita().id);
        if (this.mercadoPagoPrueba()) this.enlacePrueba.set(enlace);
        else window.location.assign(enlace);
        return;
      }
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
