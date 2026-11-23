import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Perfil } from './perfil';

it('carga y conserva los datos personales de la cuenta', async () => {
  const api = { perfil: vi.fn().mockResolvedValue({ nombre: 'Ana Prueba', dni: '01234567' }) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
    iniciar: vi.fn(), salir: vi.fn(), perfil: vi.fn()
  };
  TestBed.configureTestingModule({
    imports: [Perfil],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Perfil);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(session.perfil).toHaveBeenCalledOnce();
  expect(fixture.componentInstance.form.dni).toBe('01234567');
});
