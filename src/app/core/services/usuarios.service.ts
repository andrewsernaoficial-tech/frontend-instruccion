import { Injectable } from '@angular/core';
import type * as DTO from '../contrato-api';
import { ApiHttp } from './api-http';

@Injectable({ providedIn: 'root' })
export class UsuariosApi extends ApiHttp {
  registrar(datos: DTO.Registro) { return this.post<DTO.Usuario>('/auth/registro', datos); }
  iniciarSesion(datos: DTO.Acceso) { return this.post<DTO.Credencial>('/auth/login', datos); }
  perfil() { return this.get<DTO.Usuario>('/usuarios/me'); }
  actualizarPerfil(datos: DTO.Perfil) { return this.put<DTO.Usuario>('/usuarios/me', datos); }
  personal() { return this.get<DTO.Usuario[]>('/admin/personal'); }
  editarPersonal(id: number, datos: DTO.EdicionPersonal) {
    return this.put<DTO.Usuario>(`/admin/personal/${id}`, datos);
  }
  borrarPersonal(id: number) { return this.delete(`/admin/personal/${id}`); }
  crearPersonal(datos: DTO.Personal) {
    const { rol, nombre, email, password } = datos;
    return this.post<DTO.Usuario>('/admin/personal', rol === 'INSTRUCTOR' ? datos : { rol, nombre, email, password });
  }
  buscarCliente(contacto: string) { return this.get<DTO.Persona>('/admin/clientes/busqueda', { contacto }); }
}
