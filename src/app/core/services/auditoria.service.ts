import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class AuditoriaApi extends ApiHttp {
  auditoria() { return this.get<DTO.Evento[]>('/admin/auditoria'); }
}
