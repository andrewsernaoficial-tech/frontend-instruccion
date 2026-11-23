import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Gestion } from './gestion';

it('limita la gestión del instructor a su propio horario', async () => {
  const api = { misHorarios: vi.fn().mockResolvedValue([]) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'INSTRUCTOR' } }),
  };
  TestBed.configureTestingModule({
    imports: [Gestion],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Gestion);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(fixture.componentInstance.secciones()).toEqual(['Horarios']);
  fixture.componentInstance.mostrar('Cobros');
  expect(fixture.componentInstance.seccion()).toBe('Horarios');
  expect(api.misHorarios).toHaveBeenCalledOnce();
});
