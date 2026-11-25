import { Injectable, computed } from '@angular/core';
import { Coleccion } from './coleccion';
import { Servicio } from './models';
import { SERVICIOS_BASE } from '../data/usuarios.data';

@Injectable({ providedIn: 'root' })
export class ServiciosService extends Coleccion<Servicio> {
  readonly activos = computed(() => this.lista().filter((s) => s.activo));

  constructor() {
    super();
    this.iniciar('pcServicios.v2', SERVICIOS_BASE);
  }

  siguienteId(): string {
    return this.siguienteCodigo('SRV');
  }

  porNombre(nombre: string): Servicio | undefined {
    return this.lista().find((s) => s.nombre === nombre);
  }

  /** Reemplaza el nombre de una categoría en todos los servicios */
  renombrarCategoria(antes: string, despues: string): void {
    this.guardar(this.lista().map((s) => (s.cat === antes ? { ...s, cat: despues } : s)));
  }
}
