import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Horarios } from './horarios';

it('guarda la franja en el horario del instructor autenticado', async () => {
  const api = { misHorarios: vi.fn().mockResolvedValue([]), crearHorario: vi.fn().mockResolvedValue({}) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'INSTRUCTOR' } }),
  };
  TestBed.configureTestingModule({
    imports: [Horarios],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Horarios);
  fixture.detectChanges();
  await fixture.whenStable();
  const componente = fixture.componentInstance;
  componente.dia = '2027-02-12';
  componente.crearHorario();
  await fixture.whenStable();
  expect(api.crearHorario).toHaveBeenCalledWith({ inicio: '2027-02-12T08:00', fin: '2027-02-12T12:00' });
});
