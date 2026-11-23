import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it } from 'vitest';
import { Api, Session } from '../../core/api';
import { Acceso } from './acceso';

it('muestra la marca y el espacio de los formularios', async () => {
  const api = {};
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Acceso],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Acceso);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toContain('logo-instruccionfacil');
  expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
});
