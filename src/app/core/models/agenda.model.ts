import type { Canal, Transmision, Estado } from './tipos.model';

export interface Cita {
  id: number; alumnoId: number; instructorId: number; tipoClaseId: number; vehiculoId: number | null;
  placaPropia: string | null; marcaPropia: string | null; modeloPropio: string | null;
  transmision: Transmision; canal: Canal; inicio: string; fin: string; vence: string;
  monto: number; estado: Estado; motivo: string | null;
  nombreClase?: string; nombreInstructor?: string;
}

export interface Turno { instructorId: number; inicio: string; fin: string; flotaDisponible: boolean; }

export interface ContactoInstructor { telefono: string | null; email: string | null; }

export interface ConsultaDisponibilidad {
  instructorId: number; tipoClaseId: number; fecha: string; transmision: Transmision; vehiculoPropio: boolean;
}

export interface Reserva extends Omit<ConsultaDisponibilidad, 'fecha'> {
  alumnoId: number | null; inicio: string; canal: Canal;
  placaPropia?: string; marcaPropia?: string; modeloPropio?: string;
}

export interface Reprogramacion { instructorId: number; inicio: string; }

export interface CambioEstado { estado: Estado; motivo?: string; }
