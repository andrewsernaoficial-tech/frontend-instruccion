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
  fixture.componentRef.setInput('opciones', [{ medio: 'EFECTIVO', datos: 'Pago en la escuela' }]);
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

it('ofrece el checkout de prueba y conserva los comprobantes previos de Yape', async () => {
  const enlace = 'https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORDTST01ABC';
  const api = {
    estadoCheckout: vi.fn().mockResolvedValue({ estado: 'SIN_ORDEN', incidencia: null }),
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
  fixture.componentRef.setInput('opciones', [
    { medio: 'YAPE', datos: '' },
    { medio: 'MERCADO_PAGO', datos: '', modoPrueba: true },
  ]);
  fixture.componentRef.setInput('pagos', [{ id: 7, medio: 'YAPE', operacion: 'PAGO-ANTERIOR', monto: 50, estado: 'RECHAZADO' }]);
  await fixture.whenStable();

  const opciones = [...fixture.nativeElement.querySelectorAll('select option')];
  expect(opciones.map(opcion => opcion.textContent.trim())).toEqual(['Mercado Pago']);
  expect(fixture.nativeElement.textContent).toMatch(/Yape\s+· PAGO-ANTERIOR/);

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

it('permite cancelar una orden pendiente y notifica a la agenda', async () => {
  const api = {
    estadoCheckout: vi.fn().mockResolvedValue({ estado: 'ABIERTO', incidencia: null }),
    cancelarCheckout: vi.fn().mockResolvedValue({ estado: 'CERRADO', incidencia: null }),
  };
  TestBed.configureTestingModule({
    imports: [PagosCita],
    providers: [provideRouter([]), { provide: Api, useValue: api },
      { provide: Session, useValue: { actual: () => ({ usuario: { id: 2, rol: 'CLIENTE' } }) } }],
  });
  const fixture = TestBed.createComponent(PagosCita);
  fixture.componentRef.setInput('cita', { id: 9, monto: 50, estado: 'PENDIENTE_PAGO', vence: '2099-01-01T12:00' });
  fixture.componentRef.setInput('opciones', [{ medio: 'MERCADO_PAGO', datos: '' }, { medio: 'EFECTIVO', datos: '' }]);
  fixture.componentRef.setInput('pagos', []);
  fixture.detectChanges();
  await fixture.whenStable();
  const registrado = vi.fn();
  fixture.componentInstance.pagoRegistrado.subscribe(registrado);
  fixture.componentInstance.cancelarOrden();
  await fixture.whenStable();
  expect(api.cancelarCheckout).toHaveBeenCalledWith(9);
  expect(fixture.componentInstance.estadoOrden()).toBe('CERRADO');
  expect(fixture.componentInstance.medio).toBe('EFECTIVO');
  expect(registrado).toHaveBeenCalledOnce();
});
