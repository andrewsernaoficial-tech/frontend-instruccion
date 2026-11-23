import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Personal } from './personal';

it('solicita DNI y teléfono para crear un instructor', async () => {
  const api = {};
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Personal],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Personal);
  fixture.detectChanges();
  await fixture.whenStable();
  const form = fixture.nativeElement as HTMLElement;
  expect(form.querySelector('input[name="dni"][required]')).not.toBeNull();
  expect(form.querySelector('input[name="telefono"][required]')).not.toBeNull();
});
