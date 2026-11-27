import { Injectable, signal } from '@angular/core';
import type { Credencial, Usuario } from '../contrato-api';

interface Activa extends Credencial { vence: number; }
const SESSION_KEY = 'instruccionfacil-session';

function recuperar(): Activa | null {
  try {
    const credencial = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as Activa | null;
    return credencial?.accessToken && credencial.vence > Date.now() ? credencial : null;
  } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly state = signal<Activa | null>(recuperar());
  readonly actual = this.state.asReadonly();

  token() {
    const info = this.actual();
    return info && info.vence > Date.now() ? info.accessToken : null;
  }

  iniciar(credencial: Credencial) {
    this.guardar({ ...credencial, vence: Date.now() + credencial.expiresIn * 1000 });
  }

  perfil(usuario: Usuario) {
    const activa = this.actual();
    if (activa) this.guardar({ ...activa, usuario });
  }

  salir() {
    this.state.set(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  private guardar(activa: Activa) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(activa));
    this.state.set(activa);
  }
}
