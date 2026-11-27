import type { Estado, Medio, Rol, Transmision } from '../../core/contrato-api';

export const roles: Record<Rol, string> = {
  ADMIN: 'Administración', RECEPCION: 'Recepción', INSTRUCTOR: 'Instructor', CLIENTE: 'Alumno'
};
export const estados: Record<Estado, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', NO_ASISTIO: 'No asistió', VENCIDA: 'Vencida'
};
export const medios: Record<Medio, string> = { YAPE: 'Yape', PLIN: 'Plin', TRANSFERENCIA: 'Transferencia', EFECTIVO: 'Efectivo', MERCADO_PAGO: 'Mercado Pago' };
export const transmisiones: Record<Transmision, string> = { MECANICA: 'Mecánica', AUTOMATICA: 'Automática' };
const zona = 'America/Lima';

export function descargarArchivo(archivo: Blob, nombre: string) {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
