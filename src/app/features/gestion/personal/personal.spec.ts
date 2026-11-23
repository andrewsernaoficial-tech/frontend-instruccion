import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it, vi } from 'vitest';
import { Api, Session } from '../../../core/api';
import { Personal } from './personal';

it('solicita DNI y teléfono para crear un instructor', async () => {
  const api = { personal: vi.fn().mockResolvedValue([]) };
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'ADMIN' } }),
  };
  TestBed.configureTestingModule({
    imports: [Personal],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Personal);
  fixture.detectChanges();
  await fixture.whenStable();
  const form = fixture.nativeElement as HTMLElement;
  expect(form.querySelector('input[name="dni"][required]')).not.toBeNull();
  expect(form.querySelector('input[name="telefono"][required]')).not.toBeNull();
});

it('lista, edita y elimina una cuenta existente', async () => {
  const cuenta = {
    id: 7, rol: 'INSTRUCTOR', nombre: 'Jorge', email: 'jorge@example.test',
    telefono: '999123456', dni: '10000000', nacimiento: '1990-01-01', direccion: 'Lima'
  };
  const api = {
    personal: vi.fn().mockResolvedValue([cuenta]),
    editarPersonal: vi.fn().mockResolvedValue({ ...cuenta, nombre: 'Jorge Pérez' }),
    borrarPersonal: vi.fn().mockResolvedValue(null)
  };
  TestBed.configureTestingModule({
    imports: [Personal],
    providers: [{ provide: Api, useValue: api }, { provide: Session, useValue: {} }]
  });
  const fixture = TestBed.createComponent(Personal);
  fixture.detectChanges();
  await fixture.whenStable();

  const boton = (texto: string) => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
    .find(item => item.textContent.trim() === texto)!;
  expect(fixture.nativeElement.querySelector('.list-row').textContent).toContain('Jorge');
  boton('Editar').click();
  await fixture.whenStable();
  expect(fixture.componentInstance.personal.nombre).toBe('Jorge');
  fixture.componentInstance.personal.nombre = 'Jorge Pérez';
  fixture.componentInstance.guardarPersonal();
  await fixture.whenStable();
  expect(api.editarPersonal).toHaveBeenCalledWith(7, expect.objectContaining({ nombre: 'Jorge Pérez' }));

  const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
  try {
    boton('Eliminar').click();
    await fixture.whenStable();
    expect(api.borrarPersonal).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.querySelector('.list-row')).toBeNull();
  } finally {
    confirmar.mockRestore();
  }
});
