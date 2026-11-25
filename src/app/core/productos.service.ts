import { Injectable, computed } from '@angular/core';
import { Coleccion } from './coleccion';
import { Producto } from './models';
import { PRODUCTOS_BASE } from '../data/usuarios.data';


@Injectable({ providedIn: 'root' })
export class ProductosService extends Coleccion<Producto> {
  readonly stockBajo = computed(() => this.lista().filter((p) => p.stock <= p.minimo));

  constructor() {
    super();
    this.iniciar('pcProductos.v1', PRODUCTOS_BASE);
  }

  siguienteId(): string {
    return this.siguienteCodigo('PRD');
  }

  ajustarStock(id: string, cantidad: number): void {
    const p = this.porId(id);
    if (p) this.actualizar(id, { stock: Math.max(0, p.stock + cantidad) });
  }

  renombrarCategoria(antes: string, despues: string): void {
    this.guardar(this.lista().map((p) => (p.categoria === antes ? { ...p, categoria: despues } : p)));
  }
}
