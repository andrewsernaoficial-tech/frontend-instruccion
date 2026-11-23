import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Operaciones } from '../../../core/api';

@Component({
  selector: 'app-cobros',
  imports: [FormsModule],
  templateUrl: './cobros.html',
  styleUrl: './cobros.css',
})
export class Cobros extends Operaciones implements OnInit {
  readonly yapeTieneQr = signal(false);
  numeroYape = '';

  ngOnInit() {
    void this.ejecutar(async () => {
      const config = await this.api.yape();
      this.numeroYape = config.numero ?? '';
      this.yapeTieneQr.set(config.tieneQr);
    });
  }
  guardarYape(input: HTMLInputElement) {
    void this.ejecutar(async () => {
      const archivo = input.files?.[0] ?? null;
      if (archivo && archivo.size > 5 * 1024 * 1024) throw new Error('El QR debe pesar como máximo 5 MB.');
      const config = await this.api.guardarYape(this.numeroYape, archivo);
      this.yapeTieneQr.set(config.tieneQr);
      input.value = '';
      this.mensaje.set('Cuenta Yape guardada.');
    });
  }
}
