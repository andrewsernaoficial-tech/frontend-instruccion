import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Router } from '@angular/router';
import { IniciarSesion } from './iniciar-sesion';

it('envía el acceso y guarda la sesión', async () => {
  const api = { iniciarSesion: vi.fn().mockResolvedValue({ accessToken: 'demo' }) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
    iniciar: vi.fn(), salir: vi.fn(), perfil: vi.fn()
  };
  TestBed.configureTestingModule({
    imports: [IniciarSesion],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(IniciarSesion);
  fixture.detectChanges();
  await fixture.whenStable();
  const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  fixture.componentInstance.usuario = '  alumno@ejemplo.test  ';
  fixture.componentInstance.password = 'Clave123456';
  fixture.componentInstance.enviar();
  await fixture.whenStable();
  expect(api.iniciarSesion).toHaveBeenCalledWith({ usuario: 'alumno@ejemplo.test', password: 'Clave123456' });
  expect(session.iniciar).toHaveBeenCalledWith({ accessToken: 'demo' });
  expect(navegar).toHaveBeenCalledWith('/inicio');
});
