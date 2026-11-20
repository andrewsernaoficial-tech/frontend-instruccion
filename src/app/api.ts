import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, throwError } from 'rxjs';

export type Rol = 'ADMIN' | 'RECEPCION' | 'INSTRUCTOR' | 'CLIENTE';
export type Transmision = 'MECANICA' | 'AUTOMATICA';
export type Medio = 'YAPE' | 'PLIN' | 'TRANSFERENCIA';
export type Estado = 'PENDIENTE_PAGO' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO' | 'VENCIDA';

export interface Usuario {
  id: number; nombre: string; email: string | null; telefono: string | null; rol: Rol;
  dni: string | null; nacimiento: string | null; direccion: string | null;
}
export interface Persona { id: number; nombre: string; }
export interface Clase { id: number; nombre: string; minutos: number; tarifa: number; activo: boolean; }
export interface Vehiculo { id: number; placa: string; descripcion: string; transmision: Transmision; activo: boolean; }
export interface Cita {
  id: number; alumnoId: number; instructorId: number; tipoClaseId: number; vehiculoId: number | null;
  placaPropia: string | null; transmision: Transmision; inicio: string; fin: string; vence: string;
  monto: number; estado: Estado; motivo: string | null;
}
export interface Horario { id: number; inicio: string; fin: string; }
export interface Bloqueo extends Horario { motivo: string; }
export interface Turno { instructorId: number; inicio: string; fin: string; flotaDisponible: boolean; }
export interface Pago {
  id: number; citaId: number; medio: Medio; operacion: string; monto: number;
  estado: 'EN_REVISION' | 'APROBADO' | 'RECHAZADO'; creado: string; motivo: string | null;
}
export interface MetodoPago { medio: Medio; datos: string; }
export interface Evento {
  id: number; actorId: number | null; entidad: string; entidadId: number; accion: string; detalle: string | null; fecha: string;
}
export interface Credencial { usuario: Usuario; accessToken: string; expiresIn: number; }
interface Activa extends Credencial { vence: number; }

export const roles: Record<Rol, string> = {
  ADMIN: 'Administración', RECEPCION: 'Recepción', INSTRUCTOR: 'Instructor', CLIENTE: 'Alumno'
};
export const estados: Record<Estado, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', NO_ASISTIO: 'No asistió', VENCIDA: 'Vencida'
};
export const medios: Record<Medio, string> = { YAPE: 'Yape', PLIN: 'Plin', TRANSFERENCIA: 'Transferencia' };
export const transmisiones: Record<Transmision, string> = { MECANICA: 'Mecánica', AUTOMATICA: 'Automática' };
const SESSION_KEY = 'instruccionfacil-session';
const zona = 'America/Lima';

function recuperar(): Activa | null {
  try {
    const credencial = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as Activa | null;
    return credencial?.accessToken && credencial.vence > Date.now() ? credencial : null;
  } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly state = signal<Activa | null>(recuperar());
  readonly actual = this.state.asReadonly();

  token() {
    const info = this.actual();
    return info && info.vence > Date.now() ? info.accessToken : null;
  }

  iniciar(credencial: Credencial) {
    this.guardar({ ...credencial, vence: Date.now() + credencial.expiresIn * 1000 });
  }

  perfil(usuario: Usuario) {
    const activa = this.actual();
    if (activa) this.guardar({ ...activa, usuario });
  }

  salir() {
    this.state.set(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  private guardar(activa: Activa) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(activa));
    this.state.set(activa);
  }
}

export const autenticar: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/v1/')) return next(request);
  const session = inject(Session);
  const router = inject(Router);
  const token = session.token();
  const publica = request.url.includes('/auth/') || request.url.endsWith('/health');
  const autenticada = token && !publica
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(autenticada).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && !publica) {
      session.salir();
      void router.navigateByUrl('/acceso');
    }
    return throwError(() => error);
  }));
};

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';
  get<T>(url: string, params?: Record<string, string | boolean | number>) {
    return firstValueFrom(this.http.get<T>(this.base + url, { params }));
  }
  post<T>(url: string, data: object) { return firstValueFrom(this.http.post<T>(this.base + url, data)); }
  put<T>(url: string, data: object) { return firstValueFrom(this.http.put<T>(this.base + url, data)); }
  patch<T>(url: string, data: object) { return firstValueFrom(this.http.patch<T>(this.base + url, data)); }
  delete(url: string) { return firstValueFrom(this.http.delete(this.base + url)); }
  documento(id: number) {
    return firstValueFrom(this.http.get(`${this.base}/pagos/${id}/comprobante`, { responseType: 'blob', observe: 'response' }));
  }
}

export class Operaciones {
  protected readonly api = inject(Api);
  protected readonly session = inject(Session);
  protected readonly pendiente = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  protected async ejecutar(tarea: () => Promise<void>) {
    if (this.pendiente()) return;
    this.pendiente.set(true);
    this.error.set('');
    this.mensaje.set('');
    try { await tarea(); }
    catch (error) { this.error.set(describirError(error)); }
    finally { this.pendiente.set(false); }
  }
}

function describirError(error: unknown) {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 502 || error.status === 504) {
      return 'No hay conexión con la API. Comprueba que el backend esté ejecutándose en el puerto 8080.';
    }
    if (error.status === 403) return 'Tu cuenta no tiene permiso para esta acción.';
    const { mensaje, campos } = error.error ?? {};
    if (typeof mensaje === 'string') return [mensaje, ...(Array.isArray(campos) ? campos : [])].join('. ');
  }
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export function hoy() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: zona }).format(new Date());
}
export function diaSiguiente(fecha: string, dias: number) {
  const date = new Date(fecha + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().slice(0, 10);
}
export function fechaVisible(fecha: string, larga = false) {
  const fechaIso = fecha.length === 10 ? fecha + 'T12:00:00' : fecha;
  const date = new Date(fechaIso + '-05:00');
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: zona, weekday: larga ? 'long' : 'short', month: larga ? 'long' : 'short', day: 'numeric'
  }).format(date);
}
export function hora(fecha: string) { return fecha.slice(11, 16); }
export function soles(monto: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto);
}
export function vigente(fecha: string) { return new Date(fecha + '-05:00').getTime() > Date.now(); }
