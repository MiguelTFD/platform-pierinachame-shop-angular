import { Component, computed, inject, signal } from '@angular/core';
import { CategoriasService } from '../../../core/categorias.service';
import { Servicio } from '../../../core/models';
import { ServiciosService } from '../../../core/servicios.service';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { ServicioDrawerComponent } from '../servicio-drawer/servicio-drawer.component';


@Component({
  standalone: true,
  selector: 'app-servicios-view',
  imports: [ServicioDrawerComponent],
  templateUrl: './servicios-view.component.html'
})
export class ServiciosViewComponent {
  protected readonly srv = inject(ServiciosService);
  private readonly profesionales = inject(ProfesionalesService);
  private readonly categorias = inject(CategoriasService);


  protected readonly filtro = signal('');

 
  protected readonly opciones = computed(() => [
    { valor: '', texto: 'Todas', cantidad: this.srv.lista().length },
    ...this.categorias.lista().map((c) => ({
      valor: c, texto: c, cantidad: this.srv.lista().filter((s) => s.cat === c).length
    }))
  ]);

  /** Servicios que se muestran en la tabla según el filtro */
  protected readonly filtrados = computed(() =>
    this.srv.lista().filter((s) => !this.filtro() || s.cat === this.filtro()));

  /** Nombres de las profesionales que hacen esa categoría */
  protected quienes(cat: string): string {
    return this.profesionales.deCategoria(cat).map((p) => p.nombre.split(' ')[0]).join(', ') || '—';
  }


  protected readonly editando = signal<Servicio | 'nuevo' | null>(null);

  protected abrir(s: Servicio | null): void {
    this.editando.set(s ?? 'nuevo');
  }

  protected guardar(datos: Omit<Servicio, 'id'>): void {
    const actual = this.editando();
    if (actual && actual !== 'nuevo') this.srv.actualizar(actual.id, datos);
    else this.srv.agregar({ id: this.srv.siguienteId(), ...datos });
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