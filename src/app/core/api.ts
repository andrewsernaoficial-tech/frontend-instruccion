import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, PendingTasks, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, throwError } from 'rxjs';

import type { Credencial, Estado, Medio, Rol, Transmision, Usuario } from './contrato-api';
import type * as DTO from './contrato-api';

export type { Canal, Cita, Clase, Credencial, Estado, Evento, Bloqueo, Horario, Medio, MetodoPago,
  Pago, Persona, Personal, ContactoInstructor, Rol, Transmision, Turno, Usuario, Vehiculo } from './contrato-api';

interface Activa extends Credencial { vence: number; }

export const roles: Record<Rol, string> = {
  ADMIN: 'Administración', RECEPCION: 'Recepción', INSTRUCTOR: 'Instructor', CLIENTE: 'Alumno'
};
export const estados: Record<Estado, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', NO_ASISTIO: 'No asistió', VENCIDA: 'Vencida'
};
export const medios: Record<Medio, string> = { YAPE: 'Yape', PLIN: 'Plin', TRANSFERENCIA: 'Transferencia', EFECTIVO: 'Efectivo' };
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
  private get<T>(url: string, params?: Record<string, string | boolean | number>) {
    return firstValueFrom(this.http.get<T>(this.base + url, { params }));
  }
  private post<T>(url: string, data: object) { return firstValueFrom(this.http.post<T>(this.base + url, data)); }
  private put<T>(url: string, data: object) { return firstValueFrom(this.http.put<T>(this.base + url, data)); }
  private patch<T>(url: string, data: object) { return firstValueFrom(this.http.patch<T>(this.base + url, data)); }
  private delete(url: string) { return firstValueFrom(this.http.delete(this.base + url)); }
  registrar(datos: DTO.Registro) { return this.post<DTO.Usuario>('/auth/registro', datos); }
  iniciarSesion(datos: DTO.Acceso) { return this.post<DTO.Credencial>('/auth/login', datos); }
  perfil() { return this.get<DTO.Usuario>('/usuarios/me'); }
  actualizarPerfil(datos: DTO.Perfil) { return this.put<DTO.Usuario>('/usuarios/me', datos); }
  personal() { return this.get<DTO.Usuario[]>('/admin/personal'); }
  editarPersonal(id: number, datos: DTO.EdicionPersonal) {
    return this.put<DTO.Usuario>(`/admin/personal/${id}`, datos);
  }
  borrarPersonal(id: number) { return this.delete(`/admin/personal/${id}`); }
  crearPersonal(datos: DTO.Personal) {
    const { rol, nombre, email, password } = datos;
    return this.post<DTO.Usuario>('/admin/personal', rol === 'INSTRUCTOR' ? datos : { rol, nombre, email, password });
  }
  buscarCliente(contacto: string) { return this.get<DTO.Persona>('/admin/clientes/busqueda', { contacto }); }

  clases() { return this.get<DTO.Clase[]>('/tipos-clase'); }
  clasesAdmin() { return this.get<DTO.Clase[]>('/admin/tipos-clase'); }
  guardarClase(id: number | null, datos: DTO.TipoClase) {
    return id === null ? this.post<DTO.Clase>('/admin/tipos-clase', datos)
      : this.put<DTO.Clase>(`/admin/tipos-clase/${id}`, datos);
  }
  borrarClase(id: number) { return this.delete(`/admin/tipos-clase/${id}`); }
  instructores() { return this.get<DTO.Persona[]>('/instructores'); }
  horarios(id: number, fecha: string) { return this.get<DTO.Horario[]>(`/admin/instructores/${id}/horarios`, { fecha }); }
  misHorarios(fecha: string) { return this.get<DTO.Horario[]>('/instructor/horarios', { fecha }); }
  crearHorario(datos: DTO.Ventana) { return this.post<DTO.Horario>('/instructor/horarios', datos); }
  quitarHorario(id: number) { return this.delete(`/instructor/horarios/${id}`); }
  flota() { return this.get<DTO.Vehiculo[]>('/admin/vehiculos'); }
  guardarVehiculo(id: number | null, datos: DTO.DatosVehiculo) {
    return id === null ? this.post<DTO.Vehiculo>('/admin/vehiculos', datos)
      : this.put<DTO.Vehiculo>(`/admin/vehiculos/${id}`, datos);
  }
  bloqueos(id: number) { return this.get<DTO.Bloqueo[]>(`/admin/vehiculos/${id}/bloqueos`); }
  crearBloqueo(id: number, datos: DTO.DatosBloqueo) { return this.post<DTO.Bloqueo>(`/admin/vehiculos/${id}/bloqueos`, datos); }
  quitarBloqueo(id: number) { return this.delete(`/admin/bloqueos/${id}`); }
  auditoria() { return this.get<DTO.Evento[]>('/admin/auditoria'); }

  disponibilidad(datos: DTO.ConsultaDisponibilidad) { return this.get<DTO.Turno[]>('/disponibilidad', { ...datos }); }
  citas(desde: string, hasta: string) { return this.get<DTO.Cita[]>('/citas', { desde, hasta }); }
  cita(id: number) { return this.get<DTO.Cita>(`/citas/${id}`); }
  reservar(datos: DTO.Reserva) { return this.post<DTO.Cita>('/citas', datos); }
  cambiarEstado(id: number, datos: DTO.CambioEstado) { return this.patch<DTO.Cita>(`/citas/${id}/estado`, datos); }
  reprogramar(id: number, datos: DTO.Reprogramacion) { return this.patch<DTO.Cita>(`/citas/${id}/reprogramar`, datos); }

  contactoInstructor(id: number) { return this.get<DTO.ContactoInstructor>(`/citas/${id}/instructor-contacto`); }
  yape() { return this.get<DTO.Yape>('/admin/pagos/yape'); }
  guardarYape(numero: string, qr: File | null) {
    const form = new FormData();
    form.set('numero', numero);
    if (qr) form.set('qr', qr);
    return firstValueFrom(this.http.put<DTO.Yape>(`${this.base}/admin/pagos/yape`, form));
  }
  qrYape() { return firstValueFrom(this.http.get(`${this.base}/pagos/yape/qr`, { responseType: 'blob' })); }
  recibo(id: number) { return firstValueFrom(this.http.get(`${this.base}/pagos/${id}/recibo`, { responseType: 'blob' })); }
  mediosPago() { return this.get<DTO.MetodoPago[]>('/pagos/medios'); }
  pagos(id: number) { return this.get<DTO.Pago[]>(`/citas/${id}/pagos`); }
  pendientesPago() { return this.get<DTO.Pago[]>('/admin/pagos/pendientes'); }
  revisarPago(id: number, datos: DTO.Revision) { return this.patch<DTO.Pago>(`/admin/pagos/${id}/revision`, datos); }
  cargarComprobante(id: number, datos: DTO.CargaComprobante) {
    const form = new FormData();
    form.set('medio', datos.medio);
    if (datos.operacion) form.set('operacion', datos.operacion);
    if (datos.archivo) form.set('archivo', datos.archivo);
    return this.post<DTO.Pago>(`/citas/${id}/pagos`, form);
  }
  documento(id: number) {
    return firstValueFrom(this.http.get(`${this.base}/pagos/${id}/comprobante`, { responseType: 'blob', observe: 'response' }));
  }
}

export function descargarArchivo(archivo: Blob, nombre: string) {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
