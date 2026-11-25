import { Component, inject, signal } from '@angular/core';
import { Servicio } from '../../../core/models';
import { ServiciosService } from '../../../core/servicios.service';
import { ServicioDrawerComponent } from '../servicio-drawer/servicio-drawer.component';

/** Tabla de servicios con crear / editar / eliminar (solo administradora) */
@Component({
  standalone: true,
  selector: 'app-servicios-view',
  imports: [ServicioDrawerComponent],
  templateUrl: './servicios-view.component.html'
})
export class ServiciosViewComponent {
  protected readonly srv = inject(ServiciosService);

  /** null = cajón cerrado · 'nuevo' = creando · Servicio = editando ese */
  protected readonly editando = signal<Servicio | 'nuevo' | null>(null);

  protected abrir(s: Servicio | null): void {
    this.editando.set(s ?? 'nuevo');
  }

  protected guardar(datos: Omit<Servicio, 'id'>): void {
    const actual = this.editando();
    if (actual && actual !== 'nuevo') this.srv.editar(actual.id, datos);
    else this.srv.crear(datos);
    this.editando.set(null);
  }

  protected eliminar(s: Servicio): void {
    if (window.confirm(`¿Eliminar "${s.nombre}"? Esta acción no se puede deshacer.`)) {
      this.srv.eliminar(s.id);
    }
  }

  protected servicioEnCajon(): Servicio | null {
    const e = this.editando();
    return e && e !== 'nuevo' ? e : null;
  }
}
