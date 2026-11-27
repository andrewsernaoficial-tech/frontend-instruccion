import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class AgendaApi extends ApiHttp {
  disponibilidad(datos: DTO.ConsultaDisponibilidad) { return this.get<DTO.Turno[]>('/disponibilidad', { ...datos }); }
  citas(desde: string, hasta: string) { return this.get<DTO.Cita[]>('/citas', { desde, hasta }); }
  cita(id: number) { return this.get<DTO.Cita>(`/citas/${id}`); }
  reservar(datos: DTO.Reserva) { return this.post<DTO.Cita>('/citas', datos); }
  cambiarEstado(id: number, datos: DTO.CambioEstado) { return this.patch<DTO.Cita>(`/citas/${id}/estado`, datos); }
  reprogramar(id: number, datos: DTO.Reprogramacion) { return this.patch<DTO.Cita>(`/citas/${id}/reprogramar`, datos); }
  contactoInstructor(id: number) { return this.get<DTO.ContactoInstructor>(`/citas/${id}/instructor-contacto`); }
}
