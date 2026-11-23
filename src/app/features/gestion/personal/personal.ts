import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Operaciones, Personal as DatosPersonal, hoy } from '../../../core/api';

const personalNuevo = (rol: DatosPersonal['rol'] = 'INSTRUCTOR'): DatosPersonal => ({
  rol, nombre: '', email: '', password: '', telefono: '', dni: '', nacimiento: '', direccion: ''
});

@Component({
  selector: 'app-personal',
  imports: [FormsModule],
  templateUrl: './personal.html',
  styleUrl: './personal.css',
})
export class Personal extends Operaciones {
  readonly hoy = hoy;
  personal = personalNuevo();

  guardarPersonal() {
    void this.ejecutar(async () => {
      const cuenta = await this.api.crearPersonal(this.personal);
      this.personal = personalNuevo(this.personal.rol);
      this.mensaje.set(`Cuenta de ${cuenta.nombre} creada.`);
    });
  }
}
