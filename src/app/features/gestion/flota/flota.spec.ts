import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Flota } from './flota';

it('lista los vehículos para consultar disponibilidad', async () => {
  const api = { flota: vi.fn().mockResolvedValue([{ id: 1, placa: 'ABC-123', descripcion: 'Auto', transmision: 'MECANICA', activo: true }]) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Flota],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Flota);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(api.flota).toHaveBeenCalledOnce();
  expect(fixture.nativeElement.textContent).toContain('ABC-123');
});
