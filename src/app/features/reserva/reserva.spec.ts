import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Reserva } from './reserva';

it('muestra el formulario cuando carga el catálogo', async () => {
  const api = { clases: vi.fn().mockResolvedValue([]), instructores: vi.fn().mockResolvedValue([]) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'CLIENTE' } }),
  };
  TestBed.configureTestingModule({
    imports: [Reserva],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Reserva);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(api.clases).toHaveBeenCalledOnce();
  expect(api.instructores).toHaveBeenCalledOnce();
  expect(fixture.nativeElement.querySelector('select[name="clase"]')).not.toBeNull();
});
