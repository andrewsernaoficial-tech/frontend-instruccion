import { HttpErrorResponse } from '@angular/common/http';
import { inject, PendingTasks, signal } from '@angular/core';
import type * as DTO from './contrato-api';
import { Api } from './api-client';
import { Session } from './services/session.service';

export class Operaciones {
  private readonly tareas = inject(PendingTasks);
  protected readonly api = inject(Api);
  protected readonly session = inject(Session);
  protected readonly pendiente = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  protected async ejecutar(tarea: () => Promise<void>) {
    if (this.pendiente()) return;
    const completar = this.tareas.add();
    this.pendiente.set(true);
    this.error.set('');
    this.mensaje.set('');
    try { await tarea(); }
    catch (error) { this.error.set(describirError(error)); }
    finally {
      this.pendiente.set(false);
      completar();
    }
  }
}

function describirError(error: unknown) {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 502 || error.status === 504) {
      return 'No hay conexión con la API. Comprueba que el backend esté ejecutándose en el puerto 8080.';
    }
    if (error.status === 403) return 'Tu cuenta no tiene permiso para esta acción.';
    const { mensaje, campos } = (error.error ?? {}) as Partial<DTO.ErrorApi>;
    if (typeof mensaje === 'string') return [mensaje, ...(Array.isArray(campos) ? campos : [])].join('. ');
  }
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}
