import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it } from 'vitest';
import { Api, Session } from '../../core/api';
import { Panel } from './panel';

it('muestra el menú de horarios del instructor y oculta la revisión de pagos', async () => {
  const api = {};
  const session = {
    actual: () => ({ usuario: { id: 1, nombre: 'Ana Prueba', rol: 'INSTRUCTOR' } }),
  };
  TestBed.configureTestingModule({
    imports: [Panel],
    providers: [provideRouter([]), { provide: Api, useValue: api }, { provide: Session, useValue: session }]
  });
  const fixture = TestBed.createComponent(Panel);
  fixture.detectChanges();
  await fixture.whenStable();
  const menu = fixture.nativeElement.querySelector('nav').textContent;
  expect(menu).toContain('Mis horarios');
  expect(menu).not.toContain('Revisión de pagos');
});
