import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bloqueo, Operaciones, Vehiculo, fechaVisible, hora, transmisiones } from '../../../core/api';

const vehiculoNuevo = (): Omit<Vehiculo, 'id'> => ({ placa: '', descripcion: '', transmision: 'MECANICA', activo: true });

@Component({
  selector: 'app-flota',
  imports: [FormsModule],
  templateUrl: './flota.html',
  styleUrl: './flota.css',
})
export class Flota extends Operaciones implements OnInit {
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly bloqueos = signal<Bloqueo[]>([]);
  readonly vehiculoBloqueo = signal<Vehiculo | null>(null);
  readonly fechaVisible = fechaVisible;
  readonly hora = hora;
  readonly transmisiones = transmisiones;
  vehiculoId: number | null = null;
  formVehiculo = vehiculoNuevo();
  bloqueoInicio = '';
  bloqueoFin = '';
  bloqueoMotivo = '';

  ngOnInit() { void this.ejecutar(() => this.cargarFlota()); }
  admin() { return this.session.actual()?.usuario.rol === 'ADMIN'; }
  editarVehiculo(r?: Vehiculo) {
    this.vehiculoId = r?.id ?? null;
    this.formVehiculo = r ? { placa: r.placa, descripcion: r.descripcion, transmision: r.transmision, activo: r.activo } : vehiculoNuevo();
  }
  guardarVehiculo() {
    void this.ejecutar(async () => {
      await this.api.guardarVehiculo(this.vehiculoId, this.formVehiculo);
      this.editarVehiculo();
      await this.cargarFlota();
      this.mensaje.set('Vehículo guardado.');
    });
  }
  retirarVehiculo(vehiculo: Vehiculo) {
    if (!window.confirm(`¿Retirar el vehículo ${vehiculo.placa} de la flota?`)) return;
    void this.ejecutar(async () => {
      await this.api.retirarVehiculo(vehiculo.id);
      if (this.vehiculoId === vehiculo.id) this.editarVehiculo();
      if (this.vehiculoBloqueo()?.id === vehiculo.id) this.vehiculoBloqueo.set(null);
      await this.cargarFlota();
      this.mensaje.set('Vehículo retirado de la flota.');
    });
  }
  verBloqueos(vehiculo: Vehiculo) {
    void this.ejecutar(async () => {
      await this.cargarBloqueos(vehiculo.id);
      this.vehiculoBloqueo.set(vehiculo);
    });
  }
  crearBloqueo(id: number) {
    void this.ejecutar(async () => {
      if (this.bloqueoInicio >= this.bloqueoFin) throw new Error('El fin del bloqueo debe ser posterior al inicio.');
      await this.api.crearBloqueo(id, {
        inicio: this.bloqueoInicio, fin: this.bloqueoFin, motivo: this.bloqueoMotivo.trim()
      });
      await this.cargarBloqueos(id);
      this.bloqueoMotivo = '';
      this.mensaje.set('Bloqueo guardado.');
    });
  }
  quitarBloqueo(vehiculoId: number, bloqueoId: number) {
    void this.ejecutar(async () => {
      await this.api.quitarBloqueo(bloqueoId);
      await this.cargarBloqueos(vehiculoId);
      this.mensaje.set('Bloqueo eliminado.');
    });
  }
  private async cargarFlota() { this.vehiculos.set(await this.api.flota()); }
  private async cargarBloqueos(id: number) { this.bloqueos.set(await this.api.bloqueos(id)); }
}
