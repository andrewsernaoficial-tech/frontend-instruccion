import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Clases } from './clases';

it('recupera el catálogo administrativo', async () => {
  const api = { clasesAdmin: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Práctica', minutos: 60, tarifa: 50, activo: true }]) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Clases],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Clases);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(api.clasesAdmin).toHaveBeenCalledOnce();
  expect(fixture.nativeElement.textContent).toContain('Práctica');
});
