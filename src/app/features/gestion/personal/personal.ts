import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Operaciones, Personal as DatosPersonal, Usuario, hoy, roles } from '../../../core/api';

const personalNuevo = (rol: DatosPersonal['rol'] = 'INSTRUCTOR'): DatosPersonal => ({
  rol, nombre: '', email: '', password: '', telefono: '', dni: '', nacimiento: '', direccion: ''
});

@Component({
  selector: 'app-personal',
  imports: [FormsModule],
  templateUrl: './personal.html',
  styleUrl: './personal.css',
})
export class Personal extends Operaciones implements OnInit {
  readonly cuentas = signal<Usuario[]>([]);
  readonly roles = roles;
  seleccion: number | null = null;
  readonly hoy = hoy;
  personal = personalNuevo();

  ngOnInit() { this.recargar(); }

  recargar() {
    void this.ejecutar(async () => this.cuentas.set(await this.api.personal()));
  }

  editar(cuenta?: Usuario) {
    this.seleccion = cuenta?.id ?? null;
    if (!cuenta) {
      this.personal = personalNuevo();
      return;
    }
    this.personal = {
      rol: cuenta.rol === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'RECEPCION',
      nombre: cuenta.nombre, email: cuenta.email ?? '', telefono: cuenta.telefono ?? '',
      dni: cuenta.dni ?? '', nacimiento: cuenta.nacimiento ?? '', direccion: cuenta.direccion ?? '', password: ''
    };
  }

  guardarPersonal() {
    void this.ejecutar(async () => {
      if (this.seleccion === null) {
        const cuenta = await this.api.crearPersonal(this.personal);
        this.personal = personalNuevo(this.personal.rol);
        this.mensaje.set(`Cuenta de ${cuenta.nombre} creada.`);
      } else {
        const { nombre, email, telefono, dni, nacimiento, direccion } = this.personal;
        const cuenta = await this.api.editarPersonal(this.seleccion, {
          nombre, email, telefono: telefono || null, dni: dni || null,
          nacimiento: nacimiento || null, direccion: direccion || null
        });
        this.editar();
        this.mensaje.set(`Cuenta de ${cuenta.nombre} actualizada.`);
      }
      this.cuentas.set(await this.api.personal());
    });
  }

  borrarPersonal(cuenta: Usuario) {
    if (!window.confirm(`¿Eliminar la cuenta de ${cuenta.nombre}? Perderá el acceso al portal.`)) return;
    void this.ejecutar(async () => {
      await this.api.borrarPersonal(cuenta.id);
      this.cuentas.update(actuales => actuales.filter(item => item.id !== cuenta.id));
      if (this.seleccion === cuenta.id) this.editar();
      this.mensaje.set('Cuenta eliminada.');
    });
  }
}
