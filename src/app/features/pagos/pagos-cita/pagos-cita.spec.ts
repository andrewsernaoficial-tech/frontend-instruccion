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

it('abre el checkout de prueba aparte y actualiza la reserva al confirmar el pago', async () => {
  const enlace = 'https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORDTST01ABC';
  const api = {
    iniciarCheckout: vi.fn().mockResolvedValue({ enlace }),
    verificarCheckout: vi.fn()
      .mockResolvedValueOnce({ estado: 'EN_PROCESO', incidencia: null })
      .mockResolvedValueOnce({ estado: 'ACREDITADO', incidencia: null }),
  };
  const session = { actual: () => ({ usuario: { id: 2, rol: 'CLIENTE' } }) };
  TestBed.configureTestingModule({
    imports: [PagosCita],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }],
  });
  const fixture = TestBed.createComponent(PagosCita);
  fixture.componentRef.setInput('cita', { id: 9, estado: 'PENDIENTE_PAGO', vence: '2099-01-01T12:00' });
  fixture.componentRef.setInput('opciones', [{ medio: 'MERCADO_PAGO', datos: '', tieneQr: false, modoPrueba: true }]);
  fixture.componentRef.setInput('pagos', []);
  await fixture.whenStable();

  const registrado = vi.fn();
  fixture.componentInstance.pagoRegistrado.subscribe(registrado);
  fixture.componentInstance.enviarPago();
  await fixture.whenStable();
  const link = fixture.nativeElement.querySelector('a[target="_blank"]');
  expect(link?.getAttribute('href')).toBe(enlace);
  expect(api.iniciarCheckout).toHaveBeenCalledWith(9);

  const verificar = [...fixture.nativeElement.querySelectorAll('button')]
    .find(button => button.textContent.includes('Verificar pago de prueba'));
  expect(verificar).toBeDefined();
  verificar!.click();
  await fixture.whenStable();
  expect(fixture.nativeElement.textContent).toContain('aún no ha acreditado');
  expect(registrado).not.toHaveBeenCalled();
  verificar!.click();
  await fixture.whenStable();
  expect(api.verificarCheckout).toHaveBeenNthCalledWith(2, 9);
  expect(fixture.nativeElement.textContent).toContain('Pago de prueba aprobado');
  expect(registrado).toHaveBeenCalledOnce();
});
