import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Pagos } from './pagos';

it('confirma un pago y recarga la lista de revisión', async () => {
  const api = { pendientesPago: vi.fn().mockResolvedValue([]), revisarPago: vi.fn().mockResolvedValue({}) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Pagos],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Pagos);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.componentInstance.resolver(5, true);
  await fixture.whenStable();
  expect(api.revisarPago).toHaveBeenCalledWith(5, { aprobar: true, motivo: null });
  expect(api.pendientesPago).toHaveBeenCalledTimes(2);
});
