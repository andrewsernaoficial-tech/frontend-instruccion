import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { expect, it } from 'vitest';
import { routes } from './app.routes';
import { Api, Session } from './core/api';

it('lleva al visitante al acceso y le permite abrir el registro', async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: Session, useValue: { token: () => null } },
      { provide: Api, useValue: {} }
    ]
  });
  const harness = await RouterTestingHarness.create('/');
  expect(TestBed.inject(Router).url).toBe('/acceso');
  expect(harness.routeNativeElement?.querySelector('app-iniciar-sesion')).not.toBeNull();

  await harness.navigateByUrl('/registro');
  expect(harness.routeNativeElement?.querySelector('app-registro')).not.toBeNull();
  expect(harness.routeNativeElement?.querySelector('app-iniciar-sesion')).toBeNull();
});
