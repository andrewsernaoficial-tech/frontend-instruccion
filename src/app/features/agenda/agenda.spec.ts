import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../core/api';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Agenda } from './agenda';

it('carga la agenda del instructor sin consultar sus pagos', async () => {
  const api = {
    clases: vi.fn().mockResolvedValue([]), instructores: vi.fn().mockResolvedValue([]),
    citas: vi.fn().mockResolvedValue([]), mediosPago: vi.fn()
  };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'INSTRUCTOR' } }),
  };
  TestBed.configureTestingModule({
    imports: [Agenda],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }, { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }]
  });
  const fixture = TestBed.createComponent(Agenda);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(api.citas).toHaveBeenCalledOnce();
  expect(api.mediosPago).not.toHaveBeenCalled();
  expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Agenda');
});
