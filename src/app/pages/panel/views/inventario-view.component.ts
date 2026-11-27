import { Component, inject, signal } from '@angular/core';
import { Producto } from '../../../core/models';
import { ProductosService } from '../../../core/productos.service';
import { ProductoDrawerComponent } from '../drawers/producto-drawer.component';

/**
 * Inventario (antes estaba separado en Productos + Inventario).
 * Aquí se agregan, editan y eliminan productos, y se ajusta su stock.
 */
@Component({
  standalone: true,
  selector: 'app-inventario-view',
  imports: [ProductoDrawerComponent],
  template: `
    <div class="bar">
      <input class="campo" type="search" placeholder="Buscar producto o marca" (input)="texto.set($any($event.target).value)">
      <button class="btn-sm" type="button" (click)="abrir(null)"><i class="fa-solid fa-plus"></i> Agregar producto</button>
    </div>

    @if (productos.stockBajo().length) {
      <div class="alerta">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <b>{{ productos.stockBajo().length }} productos con stock bajo</b>
          <span>{{ nombresBajos() }}</span>
        </div>
      </div>
    }

    @if (filtrados().length) {
      <div class="table-wrap">
        <table class="tabla-movil">
          <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Mínimo</th><th>Estado</th><th>Ajustar stock</th><th><span class="sr">Acciones</span></th></tr></thead>
          <tbody>
            @for (p of filtrados(); track p.id) {
              <tr>
                <td data-label="Producto"><b>{{ p.nombre }}</b><br><span class="mini">{{ p.marca || '—' }} · {{ p.id }}</span></td>
                <td data-label="Categoría">{{ p.categoria }}</td>
                <td data-label="Precio">S/ {{ p.precio }}</td>
                <td data-label="Stock"><b class="stock-num">{{ p.stock }}</b></td>
                <td data-label="Mínimo">{{ p.minimo }}</td>
                <td data-label="Estado"><span class="tag" [class.on]="p.stock > p.minimo" [class.off]="p.stock <= p.minimo">{{ p.stock > p.minimo ? 'OK' : 'Bajo' }}</span></td>
                <td data-label="Ajustar stock" class="ajuste">
                  <button class="icon-btn" type="button" [attr.aria-label]="'Restar 1 a ' + p.nombre" (click)="productos.ajustarStock(p.id, -1)">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input class="campo mini-num" type="number" min="1" value="1" #cant [attr.aria-label]="'Cantidad para ' + p.nombre">
                  <button class="icon-btn" type="button" [attr.aria-label]="'Sumar a ' + p.nombre" (click)="sumar(p, cant.value)">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </td>
                <td class="acc">
                  <button class="icon-btn" type="button" [attr.aria-label]="'Editar ' + p.nombre" (click)="abrir(p)"><i class="fa-solid fa-pen"></i></button>
                  <button class="icon-btn" type="button" [attr.aria-label]="'Eliminar ' + p.nombre" (click)="eliminar(p)"><i class="fa-regular fa-trash-can"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="empty"><i class="fa-solid fa-box-open"></i><h2>Sin productos</h2><p>Agrega uno con “Agregar producto”.</p></div>
    }

    <app-producto-drawer [abierto]="abierto()" [producto]="seleccionado()" (cerrar)="abierto.set(false)" />
  `
})
export class InventarioViewComponent {
  protected readonly productos = inject(ProductosService);
  protected readonly texto = signal('');
  protected readonly abierto = signal(false);
  protected readonly seleccionado = signal<Producto | null>(null);

  protected filtrados(): Producto[] {
    const t = this.texto().trim().toLowerCase();
    return this.productos.lista().filter((p) => !t || p.nombre.toLowerCase().includes(t) || p.marca.toLowerCase().includes(t));
  }

  protected nombresBajos(): string {
    return this.productos.stockBajo().map((p) => `${p.nombre} (${p.stock})`).join(' · ');
  }

  protected sumar(p: Producto, cantidad: string): void {
    const n = Math.floor(Number(cantidad));
    if (n > 0) this.productos.ajustarStock(p.id, n);
  }

  protected abrir(p: Producto | null): void {
    this.seleccionado.set(p);
    this.abierto.set(true);
  }

  protected eliminar(p: Producto): void {
    if (window.confirm(`¿Eliminar "${p.nombre}" del inventario?`)) this.productos.eliminar(p.id);
  }
}
