import type { Medio } from './tipos.model';

export interface Pago {
  id: number; citaId: number; medio: Medio; operacion: string; monto: number;
  estado: 'EN_REVISION' | 'APROBADO' | 'RECHAZADO'; creado: string; revisado: string | null; revisorId: number | null; motivo: string | null;
}

export interface MetodoPago { medio: Medio; datos: string; modoPrueba?: boolean; }

export interface VerificacionCheckout {
  estado: 'ABIERTO' | 'EN_PROCESO' | 'ACREDITADO' | 'CERRADO' | 'INCIDENCIA';
  incidencia: string | null;
}

export interface CargaComprobante { medio: Medio; operacion?: string; archivo?: File; }

export interface Revision { aprobar: boolean; motivo: string | null; }

export interface EnvioCorreo { estado: 'PENDIENTE' | 'ENVIANDO' | 'ENVIADO' | 'FALLIDO'; }
