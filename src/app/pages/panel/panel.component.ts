import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CitasService } from '../../core/citas.service';
import { fechaCorta, horaAMPM } from '../../core/fechas';
import { NotificacionesService } from '../../core/notificaciones.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { ServiciosViewComponent } from './servicios-view/servicios-view.component';
import { AgendaViewComponent } from './views/agenda-view.component';
import { CajaViewComponent } from './views/caja-view.component';
import { CategoriasViewComponent } from './views/categorias-view.component';
import { CitasViewComponent } from './views/citas-view.component';
import { ClientasViewComponent } from './views/clientas-view.component';
import { ComisionesViewComponent } from './views/comisiones-view.component';
import { InventarioViewComponent } from './views/inventario-view.component';
import { MisServiciosViewComponent } from './views/mis-servicios-view.component';
import { PerfilViewComponent } from './views/perfil-view.component';
import { ProfesionalesViewComponent } from './views/profesionales-view.component';
import { ReportesViewComponent } from './views/reportes-view.component';
import { UsuariosViewComponent } from './views/usuarios-view.component';

/**
 * Panel interno (antes: panel.html + js/panel.js).
 * El menú lateral se arma según el rol de quien inició sesión,
 * y cada opción del menú muestra su propio componente.
 */
@Component({
  standalone: true,
  selector: 'app-panel',
  imports: [
    RouterLink, AvatarComponent,
    DashboardViewComponent, AgendaViewComponent, CitasViewComponent, CajaViewComponent, InventarioViewComponent,
    ReportesViewComponent, ServiciosViewComponent, CategoriasViewComponent, ProfesionalesViewComponent,
    ClientasViewComponent, UsuariosViewComponent,
    MisServiciosViewComponent, ComisionesViewComponent, PerfilViewComponent
  ],
  host: { class: 'portal' },
  templateUrl: './panel.component.html'
})
export class PanelComponent {
  protected readonly auth = inject(AuthService);
  private readonly title = inject(Title);
  private readonly citas = inject(CitasService);
  protected readonly notis = inject(NotificacionesService);

  protected readonly rol = this.auth.rol;
  protected readonly vista = signal('dashboard');
  protected readonly menuAbierto = signal(false);

  /** Nombre visible de cada sección, por ejemplo { dashboard: 'Dashboard', ... } */
  private readonly nombres = computed(() => {
    const mapa = new Map<string, string>();
    this.rol()?.grupos.forEach((g) => g.items.forEach((it) => mapa.set(it.id, it.texto)));
    return mapa;
  });

  protected readonly tituloVista = computed(() => this.nombres().get(this.vista()) ?? 'Dashboard');

  constructor() {
    this.ir('dashboard');

    // Cuando alguien reserva en la web (en otra pestaña), avisar SOLO a quien corresponde:
    // a la administradora y a las trabajadoras de esa categoría.
    const dejarDeEscuchar = this.citas.alLlegarCitas((nuevas) => {
      nuevas.filter((c) => this.auth.puedeVer(c)).forEach((c) => {
        this.notis.mostrar(
          `Nueva cita: ${c.servicio}`,
          `${c.nombre} · ${fechaCorta(c.fecha)} · ${horaAMPM(c.hora)}`
        );
      });
    });
    inject(DestroyRef).onDestroy(dejarDeEscuchar);
  }

  protected ir(id: string): void {
    this.vista.set(this.nombres().has(id) ? id : 'dashboard');
    this.title.setTitle(this.tituloVista() + ' · Pierina Chame Beauty Studio');
    this.menuAbierto.set(false);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  @HostListener('window:keydown.escape')
  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
