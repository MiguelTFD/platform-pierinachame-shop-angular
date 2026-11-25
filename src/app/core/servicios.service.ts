import { Injectable, inject, signal } from '@angular/core';
import { Servicio } from './models';
import { StorageService } from './storage.service';
import { SERVICIOS_BASE } from '../data/usuarios.data';

/** CRUD de servicios del panel (se guarda en localStorage hasta tener servidor) */
@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly CLAVE = 'pcServicios';
  private readonly storage = inject(StorageService);

  readonly lista = signal<Servicio[]>(this.storage.leer<Servicio[]>(this.CLAVE) ?? SERVICIOS_BASE);

  siguienteId(): string {
    const max = this.lista().reduce((m, s) => Math.max(m, parseInt(s.id.slice(4), 10) || 0), 0);
    return 'SRV-' + String(max + 1).padStart(3, '0');
  }

  crear(datos: Omit<Servicio, 'id'>): void {
    this.actualizar([...this.lista(), { id: this.siguienteId(), ...datos }]);
  }

  editar(id: string, datos: Omit<Servicio, 'id'>): void {
    this.actualizar(this.lista().map((s) => (s.id === id ? { ...s, ...datos } : s)));
  }

  eliminar(id: string): void {
    this.actualizar(this.lista().filter((s) => s.id !== id));
  }

  private actualizar(nueva: Servicio[]): void {
    this.lista.set(nueva);
    this.storage.guardar(this.CLAVE, nueva);
  }
}
