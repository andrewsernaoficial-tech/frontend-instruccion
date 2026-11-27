import type { Transmision } from './tipos.model';

export interface Clase { id: number; nombre: string; minutos: number; tarifa: number; activo: boolean; }

export interface Vehiculo { id: number; placa: string; descripcion: string; transmision: Transmision; activo: boolean; }

export interface Ventana { inicio: string; fin: string; }

export interface Horario extends Ventana { id: number; instructorId: number; }

export interface Bloqueo extends Ventana { id: number; vehiculoId: number; motivo: string; }

export type TipoClase = Omit<Clase, 'id'>;

export type DatosVehiculo = Omit<Vehiculo, 'id'>;

export interface DatosBloqueo extends Ventana { motivo: string; }
