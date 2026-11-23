import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { PagosCita } from './pagos-cita';

it('registra efectivo sin solicitar adjunto ni operación', async () => {
  const api = { cargarComprobante: vi.fn().mockResolvedValue({}) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [PagosCita],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(PagosCita);
  fixture.componentRef.setInput('cita', { id: 7, estado: 'PENDIENTE_PAGO', vence: '2099-01-01T12:00' });
  fixture.componentRef.setInput('opciones', [{ medio: 'EFECTIVO', datos: 'Pago en la escuela', tieneQr: false }]);
  fixture.componentRef.setInput('pagos', []);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeNull();
  const registrado = vi.fn();
  fixture.componentInstance.pagoRegistrado.subscribe(registrado);
  fixture.componentInstance.enviarPago();
  await fixture.whenStable();
  expect(api.cargarComprobante).toHaveBeenCalledWith(7, { medio: 'EFECTIVO' });
  expect(registrado).toHaveBeenCalledOnce();
});
