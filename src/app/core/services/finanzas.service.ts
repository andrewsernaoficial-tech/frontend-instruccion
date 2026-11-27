import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class FinanzasApi extends ApiHttp {
  ingresos(desde: string, hasta: string) {
    return this.get<DTO.Ingresos>('/admin/ingresos', { desde, hasta });
  }
}
