import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Router } from '@angular/router';
import { Registro } from './registro';

it('solicita los datos obligatorios y registra al alumno', async () => {
  const api = { registrar: vi.fn().mockResolvedValue({}), iniciarSesion: vi.fn().mockResolvedValue({ accessToken: 'demo' }) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Registro],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Registro);
  fixture.detectChanges();
  await fixture.whenStable();
  const form = fixture.nativeElement as HTMLElement;
  for (const name of ['nombre', 'email', 'telefono', 'dni', 'nacimiento', 'direccion', 'password']) {
    expect(form.querySelector(`input[name="${name}"][required]`)).not.toBeNull();
  }
  expect(form.querySelector<HTMLButtonElement>('button.primary')?.disabled).toBe(true);
  vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const alumno = {
    nombre: 'Ana Prueba', email: 'ana@ejemplo.test', telefono: '999123456',
    dni: '01234567', nacimiento: '2000-01-02', direccion: 'Av. Lima', password: 'Clave123456'
  };
  Object.assign(fixture.componentInstance, alumno);
  fixture.componentInstance.enviar();
  await fixture.whenStable();
  expect(api.registrar).toHaveBeenCalledWith(alumno);
  expect(api.iniciarSesion).toHaveBeenCalledWith({ usuario: alumno.email, password: alumno.password });
});
