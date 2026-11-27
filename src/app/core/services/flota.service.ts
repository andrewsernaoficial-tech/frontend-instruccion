import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class FlotaApi extends ApiHttp {
  flota() { return this.get<DTO.Vehiculo[]>('/admin/vehiculos'); }
  guardarVehiculo(id: number | null, datos: DTO.DatosVehiculo) {
    return id === null ? this.post<DTO.Vehiculo>('/admin/vehiculos', datos)
      : this.put<DTO.Vehiculo>(`/admin/vehiculos/${id}`, datos);
  }
  bloqueos(id: number) { return this.get<DTO.Bloqueo[]>(`/admin/vehiculos/${id}/bloqueos`); }
  crearBloqueo(id: number, datos: DTO.DatosBloqueo) { return this.post<DTO.Bloqueo>(`/admin/vehiculos/${id}/bloqueos`, datos); }
  quitarBloqueo(id: number) { return this.delete(`/admin/bloqueos/${id}`); }
  retirarVehiculo(id: number) { return this.delete(`/admin/vehiculos/${id}`); }
}
