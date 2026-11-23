import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Clases } from './clases';

it('recupera el catálogo administrativo y permite eliminar una clase', async () => {
  const api = { clasesAdmin: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Práctica', minutos: 60, tarifa: 50, activo: true }]), borrarClase: vi.fn().mockResolvedValue(null) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Clases],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Clases);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(api.clasesAdmin).toHaveBeenCalledOnce();
  expect(fixture.nativeElement.textContent).toContain('Práctica');
  const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
  try {
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.list-row button');
    const eliminar = Array.from(botones).find(boton => boton.textContent.trim() === 'Eliminar')!;
    eliminar.click();
    await fixture.whenStable();
    expect(api.borrarClase).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.clases()).toEqual([]);
  } finally {
    confirmar.mockRestore();
  }
});
