import type { Rol } from './tipos.model';

export interface Usuario {
  id: number; nombre: string; email: string | null; telefono: string | null; rol: Rol;
  dni: string | null; nacimiento: string | null; direccion: string | null;
}

export interface Persona { id: number; nombre: string; }

export interface Credencial { usuario: Usuario; accessToken: string; tokenType: string; expiresIn: number; }

export interface Acceso { usuario: string; password: string; }

export interface Registro {
  nombre: string; email: string; telefono: string; dni: string; nacimiento: string; direccion: string; password: string;
}

export interface Perfil extends Omit<Registro, 'password' | 'email' | 'telefono'> {
  email: string | null; telefono: string | null;
}

export type EdicionPersonal = Omit<Perfil, 'dni' | 'nacimiento' | 'direccion'> & {
  dni: string | null; nacimiento: string | null; direccion: string | null;
};

export interface Personal {
  rol: 'INSTRUCTOR' | 'RECEPCION'; nombre: string; email: string; password: string;
  telefono: string; dni: string; nacimiento: string; direccion: string;
}
