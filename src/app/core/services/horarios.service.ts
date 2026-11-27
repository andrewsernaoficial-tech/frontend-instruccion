import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class HorariosApi extends ApiHttp {
  instructores() { return this.get<DTO.Persona[]>('/instructores'); }
  horarios(id: number, fecha: string) { return this.get<DTO.Horario[]>(`/admin/instructores/${id}/horarios`, { fecha }); }
  misHorarios(fecha: string) { return this.get<DTO.Horario[]>('/instructor/horarios', { fecha }); }
  crearHorario(datos: DTO.Ventana) { return this.post<DTO.Horario>('/instructor/horarios', datos); }
  quitarHorario(id: number) { return this.delete(`/instructor/horarios/${id}`); }
}
