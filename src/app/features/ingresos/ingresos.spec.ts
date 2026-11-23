import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { Ingresos } from './ingresos';

it('carga los ingresos del periodo y muestra el total y la serie', async () => {
  const api = {
    ingresos: vi.fn().mockResolvedValue({
      total: 125, pagos: 1, dias: [{ fecha: '2026-11-23', monto: 125, pagos: 1 }],
      medios: [{ medio: 'MERCADO_PAGO', monto: 125, pagos: 1 }], incidencias: [],
    }),
  };
  TestBed.configureTestingModule({
    imports: [Ingresos],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: {} }],
  });
  const fixture = TestBed.createComponent(Ingresos);
  fixture.detectChanges();
  await fixture.whenStable();

  expect(api.ingresos).toHaveBeenCalledOnce();
  expect(fixture.componentInstance.serie()).toEqual([{ etiqueta: '11-23', monto: 125 }]);
  expect(fixture.nativeElement.textContent).toContain('Mercado Pago');
  expect(fixture.nativeElement.querySelector('.serie .barra').style.width).toBe('100%');
});
