import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Resumen } from './resumen';

it('oculta las citas canceladas y cuenta las confirmadas', async () => {
  const api = {
    citas: vi.fn().mockResolvedValue([{ id: 1, estado: 'CANCELADA' }, { id: 2, estado: 'CONFIRMADA', inicio: '2027-01-15T08:00', tipoClaseId: 1, instructorId: 1 }]),
    clases: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Práctica' }]),
    instructores: vi.fn().mockResolvedValue([{ id: 1, nombre: 'José' }])
  };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Resumen],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Resumen);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(fixture.componentInstance.citas().map(cita => cita.id)).toEqual([2]);
  expect(fixture.componentInstance.contar('CONFIRMADA')).toBe(1);
});
