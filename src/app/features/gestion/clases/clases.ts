import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Clase, Operaciones, soles } from '../../../core/api';

const claseNueva = () => ({ nombre: '', minutos: 60, tarifa: 0, activo: true });

@Component({
  selector: 'app-clases',
  imports: [FormsModule],
  templateUrl: './clases.html',
  styleUrl: './clases.css',
})
export class Clases extends Operaciones implements OnInit {
  readonly clases = signal<Clase[]>([]);
  readonly soles = soles;
  claseId: number | null = null;
  formClase = claseNueva();

  ngOnInit() { void this.ejecutar(() => this.cargarClases()); }
  editarClase(clase?: Clase) {
    this.claseId = clase?.id ?? null;
    this.formClase = clase ? { nombre: clase.nombre, minutos: clase.minutos, tarifa: clase.tarifa, activo: clase.activo } : claseNueva();
  }
  guardarClase() {
    void this.ejecutar(async () => {
      await this.api.guardarClase(this.claseId, this.formClase);
      this.editarClase();
      await this.cargarClases();
      this.mensaje.set('Clase guardada.');
    });
  }
  borrarClase(clase: Clase) {
    if (!window.confirm(`¿Eliminar la clase «${clase.nombre}» del catálogo?`)) return;
    void this.ejecutar(async () => {
      await this.api.borrarClase(clase.id);
      this.clases.update(actuales => actuales.filter(item => item.id !== clase.id));
      if (this.claseId === clase.id) this.editarClase();
      this.mensaje.set('Clase eliminada del catálogo.');
    });
  }
  private async cargarClases() { this.clases.set(await this.api.clasesAdmin()); }
}
