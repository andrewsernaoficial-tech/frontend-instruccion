import { Injectable, inject } from '@angular/core';
import { UsuariosApi } from './services/usuarios.service';
import { ClasesApi } from './services/clases.service';
import { HorariosApi } from './services/horarios.service';
import { FlotaApi } from './services/flota.service';
import { AgendaApi } from './services/agenda.service';
import { PagosApi } from './services/pagos.service';
import { FinanzasApi } from './services/finanzas.service';
import { AuditoriaApi } from './services/auditoria.service';

// Fachada de compatibilidad para componentes y pruebas existentes.
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly usuariosApi = inject(UsuariosApi);
  private readonly clasesApi = inject(ClasesApi);
  private readonly horariosApi = inject(HorariosApi);
  private readonly flotaApi = inject(FlotaApi);
  private readonly agendaApi = inject(AgendaApi);
  private readonly pagosApi = inject(PagosApi);
  private readonly finanzasApi = inject(FinanzasApi);
  private readonly auditoriaApi = inject(AuditoriaApi);
  registrar(...args: Parameters<UsuariosApi['registrar']>) { return this.usuariosApi.registrar(...args); }
  iniciarSesion(...args: Parameters<UsuariosApi['iniciarSesion']>) { return this.usuariosApi.iniciarSesion(...args); }
  perfil(...args: Parameters<UsuariosApi['perfil']>) { return this.usuariosApi.perfil(...args); }
  actualizarPerfil(...args: Parameters<UsuariosApi['actualizarPerfil']>) { return this.usuariosApi.actualizarPerfil(...args); }
  personal(...args: Parameters<UsuariosApi['personal']>) { return this.usuariosApi.personal(...args); }
  editarPersonal(...args: Parameters<UsuariosApi['editarPersonal']>) { return this.usuariosApi.editarPersonal(...args); }
  borrarPersonal(...args: Parameters<UsuariosApi['borrarPersonal']>) { return this.usuariosApi.borrarPersonal(...args); }
  crearPersonal(...args: Parameters<UsuariosApi['crearPersonal']>) { return this.usuariosApi.crearPersonal(...args); }
  buscarCliente(...args: Parameters<UsuariosApi['buscarCliente']>) { return this.usuariosApi.buscarCliente(...args); }
  clases(...args: Parameters<ClasesApi['clases']>) { return this.clasesApi.clases(...args); }
  clasesAdmin(...args: Parameters<ClasesApi['clasesAdmin']>) { return this.clasesApi.clasesAdmin(...args); }
  guardarClase(...args: Parameters<ClasesApi['guardarClase']>) { return this.clasesApi.guardarClase(...args); }
  borrarClase(...args: Parameters<ClasesApi['borrarClase']>) { return this.clasesApi.borrarClase(...args); }
  instructores(...args: Parameters<HorariosApi['instructores']>) { return this.horariosApi.instructores(...args); }
  horarios(...args: Parameters<HorariosApi['horarios']>) { return this.horariosApi.horarios(...args); }
  misHorarios(...args: Parameters<HorariosApi['misHorarios']>) { return this.horariosApi.misHorarios(...args); }
  crearHorario(...args: Parameters<HorariosApi['crearHorario']>) { return this.horariosApi.crearHorario(...args); }
  quitarHorario(...args: Parameters<HorariosApi['quitarHorario']>) { return this.horariosApi.quitarHorario(...args); }
  flota(...args: Parameters<FlotaApi['flota']>) { return this.flotaApi.flota(...args); }
  guardarVehiculo(...args: Parameters<FlotaApi['guardarVehiculo']>) { return this.flotaApi.guardarVehiculo(...args); }
  bloqueos(...args: Parameters<FlotaApi['bloqueos']>) { return this.flotaApi.bloqueos(...args); }
  crearBloqueo(...args: Parameters<FlotaApi['crearBloqueo']>) { return this.flotaApi.crearBloqueo(...args); }
  quitarBloqueo(...args: Parameters<FlotaApi['quitarBloqueo']>) { return this.flotaApi.quitarBloqueo(...args); }
  retirarVehiculo(...args: Parameters<FlotaApi['retirarVehiculo']>) { return this.flotaApi.retirarVehiculo(...args); }
  disponibilidad(...args: Parameters<AgendaApi['disponibilidad']>) { return this.agendaApi.disponibilidad(...args); }
  citas(...args: Parameters<AgendaApi['citas']>) { return this.agendaApi.citas(...args); }
  cita(...args: Parameters<AgendaApi['cita']>) { return this.agendaApi.cita(...args); }
  reservar(...args: Parameters<AgendaApi['reservar']>) { return this.agendaApi.reservar(...args); }
  cambiarEstado(...args: Parameters<AgendaApi['cambiarEstado']>) { return this.agendaApi.cambiarEstado(...args); }
  reprogramar(...args: Parameters<AgendaApi['reprogramar']>) { return this.agendaApi.reprogramar(...args); }
  contactoInstructor(...args: Parameters<AgendaApi['contactoInstructor']>) { return this.agendaApi.contactoInstructor(...args); }
  recibo(...args: Parameters<PagosApi['recibo']>) { return this.pagosApi.recibo(...args); }
  iniciarCheckout(...args: Parameters<PagosApi['iniciarCheckout']>) { return this.pagosApi.iniciarCheckout(...args); }
  estadoCheckout(...args: Parameters<PagosApi['estadoCheckout']>) { return this.pagosApi.estadoCheckout(...args); }
  cancelarCheckout(...args: Parameters<PagosApi['cancelarCheckout']>) { return this.pagosApi.cancelarCheckout(...args); }
  verificarCheckout(...args: Parameters<PagosApi['verificarCheckout']>) { return this.pagosApi.verificarCheckout(...args); }
  enviarReciboCorreo(...args: Parameters<PagosApi['enviarReciboCorreo']>) { return this.pagosApi.enviarReciboCorreo(...args); }
  mediosPago(...args: Parameters<PagosApi['mediosPago']>) { return this.pagosApi.mediosPago(...args); }
  pagos(...args: Parameters<PagosApi['pagos']>) { return this.pagosApi.pagos(...args); }
  pendientesPago(...args: Parameters<PagosApi['pendientesPago']>) { return this.pagosApi.pendientesPago(...args); }
  revisarPago(...args: Parameters<PagosApi['revisarPago']>) { return this.pagosApi.revisarPago(...args); }
  cargarComprobante(...args: Parameters<PagosApi['cargarComprobante']>) { return this.pagosApi.cargarComprobante(...args); }
  documento(...args: Parameters<PagosApi['documento']>) { return this.pagosApi.documento(...args); }
  ingresos(...args: Parameters<FinanzasApi['ingresos']>) { return this.finanzasApi.ingresos(...args); }
  auditoria(...args: Parameters<AuditoriaApi['auditoria']>) { return this.auditoriaApi.auditoria(...args); }
}
