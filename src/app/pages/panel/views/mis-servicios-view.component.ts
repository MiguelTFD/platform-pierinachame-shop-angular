import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { ServiciosService } from '../../../core/servicios.service';
import { COMISION } from '../../../data/usuarios.data';

/** Servicios que hace la profesional (según sus categorías) */
@Component({
  standalone: true,
  selector: 'app-mis-servicios-view',
  template: `
    <p class="hello">Estos son los servicios de tus categorías: {{ categorias().join(', ') || '—' }}.</p>
    <div class="table-wrap">
      <table class="tabla-movil">
        <thead><tr><th>Servicio</th><th>Categoría</th><th>Duración</th><th>Precio</th><th>Tu comisión</th></tr></thead>
        <tbody>
          @for (s of mios(); track s.id) {
            <tr>
              <td data-label="Servicio"><b>{{ s.nombre }}</b></td>
              <td data-label="Categoría">{{ s.cat }}</td>
              <td data-label="Duración">{{ s.dur }} min</td>
              <td data-label="Precio">S/ {{ s.precio }}</td>
              <td data-label="Tu comisión">S/ {{ comision(s.precio) }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="mini">Aún no tienes servicios asignados. Pídele a la administradora que revise tus categorías.</td></tr>
          }
        </tbody>
      </table>
    </div>
    <p class="mini">Comisión provisional: {{ porcentaje }} % de cada servicio atendido.</p>
  `
})
export class MisServiciosViewComponent {
  private readonly auth = inject(AuthService);
  private readonly servicios = inject(ServiciosService);
  protected readonly porcentaje = COMISION * 100;

  protected readonly categorias = computed(() => this.auth.profesional()?.categorias ?? []);
  protected readonly mios = computed(() => this.servicios.activos().filter((s) => this.categorias().includes(s.cat)));

  protected comision(precio: number): number {
    return Math.round(precio * COMISION * 100) / 100;
  }
}
