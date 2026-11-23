import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Cobros } from './cobros';

it('carga el número Yape y guarda sus cambios', async () => {
  const api = { yape: vi.fn().mockResolvedValue({ numero: '999111222', tieneQr: true }), guardarYape: vi.fn().mockResolvedValue({ tieneQr: true }) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Cobros],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Cobros);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(fixture.componentInstance.numeroYape).toBe('999111222');
  const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
  fixture.componentInstance.guardarYape(input);
  await fixture.whenStable();
  expect(api.guardarYape).toHaveBeenCalledWith('999111222', null);
});
