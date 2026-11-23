export type Rol = 'ADMIN' | 'RECEPCION' | 'INSTRUCTOR' | 'CLIENTE';
export type Canal = 'WEB' | 'PRESENCIAL' | 'WHATSAPP' | 'FACEBOOK' | 'LLAMADA';
export type Transmision = 'MECANICA' | 'AUTOMATICA';
export type Medio = 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'EFECTIVO';
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
  placaPropia: string | null; marcaPropia: string | null; modeloPropio: string | null;
  transmision: Transmision; canal: Canal; inicio: string; fin: string; vence: string;
  monto: number; estado: Estado; motivo: string | null;
  nombreClase?: string; nombreInstructor?: string;
}
export interface Ventana { inicio: string; fin: string; }
export interface Horario extends Ventana { id: number; instructorId: number; }
export interface Bloqueo extends Ventana { id: number; vehiculoId: number; motivo: string; }
export interface Turno { instructorId: number; inicio: string; fin: string; flotaDisponible: boolean; }
export interface Pago {
  id: number; citaId: number; medio: Medio; operacion: string; monto: number;
  estado: 'EN_REVISION' | 'APROBADO' | 'RECHAZADO'; creado: string; revisado: string | null; revisorId: number | null; motivo: string | null;
}
export interface MetodoPago { medio: Medio; datos: string; tieneQr: boolean; }
export interface Yape { numero: string | null; tieneQr: boolean; }
export interface ContactoInstructor { telefono: string | null; email: string | null; }
export interface Evento {
  id: number; actorId: number | null; entidad: string; entidadId: number; accion: string; detalle: string | null; fecha: string;
}
export interface Credencial { usuario: Usuario; accessToken: string; tokenType: string; expiresIn: number; }

export interface Acceso { usuario: string; password: string; }
export interface Registro {
  nombre: string; email: string; telefono: string; dni: string; nacimiento: string; direccion: string; password: string;
}
export interface Perfil extends Omit<Registro, 'password' | 'email' | 'telefono'> {
  email: string | null; telefono: string | null;
}
export type EdicionPersonal = Omit<Perfil, 'dni' | 'nacimiento' | 'direccion'> & {
  dni: string | null; nacimiento: string | null; direccion: string | null;
};
export interface Personal {
  rol: 'INSTRUCTOR' | 'RECEPCION'; nombre: string; email: string; password: string;
  telefono: string; dni: string; nacimiento: string; direccion: string;
}
export type TipoClase = Omit<Clase, 'id'>;
export type DatosVehiculo = Omit<Vehiculo, 'id'>;
export interface DatosBloqueo extends Ventana { motivo: string; }
export interface ConsultaDisponibilidad {
  instructorId: number; tipoClaseId: number; fecha: string; transmision: Transmision; vehiculoPropio: boolean;
}
export interface Reserva extends Omit<ConsultaDisponibilidad, 'fecha'> {
  alumnoId: number | null; inicio: string; canal: Canal;
  placaPropia?: string; marcaPropia?: string; modeloPropio?: string;
}
export interface Reprogramacion { instructorId: number; inicio: string; }
export interface CambioEstado { estado: Estado; motivo?: string; }
export interface CargaComprobante { medio: Medio; operacion?: string; archivo?: File; }
export interface Revision { aprobar: boolean; motivo: string | null; }
export interface ErrorApi { mensaje: string; campos?: string[]; }
