import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class PagosApi extends ApiHttp {
  recibo(id: number) { return firstValueFrom(this.http.get(`${this.base}/pagos/${id}/recibo`, { responseType: 'blob' })); }
  iniciarCheckout(id: number) {
    return this.post<{ enlace: string }>(`/citas/${id}/pagos/checkout`, {});
  }
  estadoCheckout(id: number) {
    return this.get<{ estado: string; incidencia: string | null }>(`/citas/${id}/pagos/checkout`);
  }
  cancelarCheckout(id: number) {
    return this.post<{ estado: string; incidencia: string | null }>(`/citas/${id}/pagos/checkout/cancelar`, {});
  }
  verificarCheckout(id: number) {
    return this.post<DTO.VerificacionCheckout>(`/citas/${id}/pagos/checkout/verificar`, {});
  }
  enviarReciboCorreo(id: number) {
    return this.post<DTO.EnvioCorreo>(`/pagos/${id}/recibo/correo`, {});
  }
  mediosPago() { return this.get<DTO.MetodoPago[]>('/pagos/medios'); }
  pagos(id: number) { return this.get<DTO.Pago[]>(`/citas/${id}/pagos`); }
  pendientesPago() { return this.get<DTO.Pago[]>('/admin/pagos/pendientes'); }
  revisarPago(id: number, datos: DTO.Revision) { return this.patch<DTO.Pago>(`/admin/pagos/${id}/revision`, datos); }
  cargarComprobante(id: number, datos: DTO.CargaComprobante) {
    const form = new FormData();
    form.set('medio', datos.medio);
    if (datos.operacion) form.set('operacion', datos.operacion);
    if (datos.archivo) form.set('archivo', datos.archivo);
    return this.post<DTO.Pago>(`/citas/${id}/pagos`, form);
  }
  documento(id: number) {
    return firstValueFrom(this.http.get(`${this.base}/pagos/${id}/comprobante`, { responseType: 'blob', observe: 'response' }));
  }
}
