import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Auditoria } from './auditoria';

it('muestra la acción registrada en auditoría', async () => {
  const api = { auditoria: vi.fn().mockResolvedValue([{ id: 1, entidad: 'PAGO', entidadId: 3, accion: 'APROBADO', fecha: '2027-02-05T09:00' }]) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Auditoria],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Auditoria);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(api.auditoria).toHaveBeenCalledOnce();
  expect(fixture.nativeElement.textContent).toContain('APROBADO');
});
