export type { Canal, Cita, Clase, Credencial, Estado, Evento, Bloqueo, Horario, Medio, MetodoPago,
  Pago, Persona, Personal, ContactoInstructor, Rol, Transmision, Turno, Usuario, Vehiculo } from './contrato-api';
export { Api } from './api-client';
export { Session } from './services/session.service';
export { autenticar } from './interceptors/auth.interceptor';
export { Operaciones } from './operaciones';
export * from '../shared/utils/formato';
