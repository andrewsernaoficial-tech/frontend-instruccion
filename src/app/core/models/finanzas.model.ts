import type { Medio } from './tipos.model';

export interface IngresoDiario { fecha: string; monto: number; pagos: number; }

export interface IngresoMedio { medio: Medio; monto: number; pagos: number; }

export interface IncidenciaPago { citaId: number; orden: string; detalle: string; fecha: string; }

export interface Ingresos {
  total: number; pagos: number; dias: IngresoDiario[]; medios: IngresoMedio[]; incidencias: IncidenciaPago[];
}
