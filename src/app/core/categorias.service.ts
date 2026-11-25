import { Injectable, inject, signal } from '@angular/core';
import { ProductosService } from './productos.service';
import { ProfesionalesService } from './profesionales.service';
import { ServiciosService } from './servicios.service';
import { StorageService } from './storage.service';
import { CATEGORIAS_BASE } from '../data/usuarios.data';


@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly CLAVE = 'pcCategorias.v1';
  private readonly storage = inject(StorageService);
  private readonly servicios = inject(ServiciosService);
  private readonly productos = inject(ProductosService);
  private readonly profesionales = inject(ProfesionalesService);

  readonly lista = signal<string[]>(this.storage.leer<string[]>(this.CLAVE) ?? CATEGORIAS_BASE);

  agregar(nombre: string): boolean {
    const limpio = nombre.trim();
    if (!limpio || this.existe(limpio)) return false;
    this.guardar([...this.lista(), limpio]);
    return true;
  }

  renombrar(antes: string, despues: string): boolean {
    const limpio = despues.trim();
    if (!limpio || (limpio.toLowerCase() !== antes.toLowerCase() && this.existe(limpio))) return false;
    this.guardar(this.lista().map((c) => (c === antes ? limpio : c)));
    this.servicios.renombrarCategoria(antes, limpio);
    this.productos.renombrarCategoria(antes, limpio);
    this.profesionales.lista().forEach((p) => {
      if (p.categorias.includes(antes)) {
        this.profesionales.actualizar(p.id, { categorias: p.categorias.map((c) => (c === antes ? limpio : c)) });
      }
    });
    return true;
  }

  /**
   * Borra la categoría.
   * - Si se indica "moverA", sus servicios (y productos) pasan a esa otra categoría.
   * - Si no, sus servicios se borran.
   * En ambos casos se le quita a las profesionales que la tenían marcada.
   */
  eliminar(nombre: string, moverA = ''): void {
    if (moverA) {
      this.servicios.renombrarCategoria(nombre, moverA);
      this.productos.renombrarCategoria(nombre, moverA);
    } else {
      this.servicios.lista()
        .filter((s) => s.cat === nombre)
        .forEach((s) => this.servicios.eliminar(s.id));
    }

    this.profesionales.lista().forEach((p) => {
      if (p.categorias.includes(nombre)) {
        this.profesionales.actualizar(p.id, { categorias: p.categorias.filter((c) => c !== nombre) });
      }
    });

    this.guardar(this.lista().filter((c) => c !== nombre));
  }

  private existe(nombre: string): boolean {
    return this.lista().some((c) => c.toLowerCase() === nombre.toLowerCase());
  }

  private guardar(nueva: string[]): void {
    this.lista.set(nueva);
    this.storage.guardar(this.CLAVE, nueva);
  }
}