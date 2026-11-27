import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class ClasesApi extends ApiHttp {
  clases() { return this.get<DTO.Clase[]>('/tipos-clase'); }
  clasesAdmin() { return this.get<DTO.Clase[]>('/admin/tipos-clase'); }
  guardarClase(id: number | null, datos: DTO.TipoClase) {
    return id === null ? this.post<DTO.Clase>('/admin/tipos-clase', datos)
      : this.put<DTO.Clase>(`/admin/tipos-clase/${id}`, datos);
  }
  borrarClase(id: number) { return this.delete(`/admin/tipos-clase/${id}`); }
}
