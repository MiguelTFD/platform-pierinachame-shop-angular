import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { ServiciosViewComponent } from './servicios-view/servicios-view.component';

/**
 * Panel interno (antes: panel.html + js/panel.js).
 * El menú lateral se arma según el rol de quien inició sesión.
 */
@Component({
  standalone: true,
  selector: 'app-panel',
  imports: [RouterLink, DashboardViewComponent, ServiciosViewComponent],
  host: { class: 'portal' },
  templateUrl: './panel.component.html'
})
export class PanelComponent {
  protected readonly auth = inject(AuthService);
  private readonly title = inject(Title);

  protected readonly sesion = this.auth.sesion;
  protected readonly rol = this.auth.rol;
  protected readonly vista = signal('dashboard');
  protected readonly menuAbierto = signal(false);

  protected readonly inicial = computed(() => (this.sesion()?.nombre.trim().charAt(0) ?? '').toUpperCase());

  /** Nombre visible de cada sección, por ejemplo { dashboard: 'Dashboard', ... } */
  private readonly nombres = computed(() => {
    const mapa = new Map<string, string>();
    this.rol()?.grupos.forEach((g) => g.items.forEach((it) => mapa.set(it.id, it.texto)));
    return mapa;
  });

  protected readonly tituloVista = computed(() => this.nombres().get(this.vista()) ?? 'Dashboard');

  constructor() {
    this.ir('dashboard');
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
