import { inject, signal } from '@angular/core';
import { StorageService } from './storage.service';


export abstract class Coleccion<T extends { id: string }> {
  protected readonly storage = inject(StorageService);
  private clave = '';

  readonly lista = signal<T[]>([]);

  /** Carga la lista guardada o, la primera vez, los datos provisionales */
  protected iniciar(clave: string, base: T[]): void {
    this.clave = clave;
    const guardada = this.storage.leer<T[]>(clave);
    this.lista.set(guardada ?? base);
    if (!guardada) this.storage.guardar(clave, base);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key !== clave || !e.newValue) return;
        try {
          const anterior = this.lista();
          const nueva = JSON.parse(e.newValue) as T[];
          this.lista.set(nueva);
          this.alSincronizar(anterior, nueva);
        } catch { /* dato inválido: se ignora */ }
      });
    }
  }

  protected alSincronizar(_anterior: T[], _nueva: T[]): void { /* nada por defecto uwuuu */ }

  porId(id: string): T | undefined {
    return this.lista().find((x) => x.id === id);
  }


  protected siguienteCodigo(prefijo: string, digitos = 3): string {
    const max = this.lista().reduce((m, x) => Math.max(m, parseInt(x.id.split('-')[1], 10) || 0), 0);
    return prefijo + '-' + String(max + 1).padStart(digitos, '0');
  }

  agregar(item: T): void {
    this.guardar([...this.lista(), item]);
  }

  actualizar(id: string, cambios: Partial<T>): void {
    this.guardar(this.lista().map((x) => (x.id === id ? { ...x, ...cambios } : x)));
  }

  eliminar(id: string): void {
    this.guardar(this.lista().filter((x) => x.id !== id));
  }

  protected guardar(nueva: T[]): void {
    this.lista.set(nueva);
    this.storage.guardar(this.clave, nueva);
  }
}
