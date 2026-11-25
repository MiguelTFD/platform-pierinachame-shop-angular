import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * localStorage / sessionStorage "seguros".
 * Tu proyecto usa SSR (server.ts): en el servidor no existe localStorage,
 * así que aquí revisamos si estamos en el navegador antes de usarlo.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  leer<T>(clave: string, tipo: 'local' | 'session' = 'local'): T | null {
    if (!this.enNavegador) return null;
    try {
      const raw = this.almacen(tipo).getItem(clave);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  guardar(clave: string, valor: unknown, tipo: 'local' | 'session' = 'local'): void {
    if (!this.enNavegador) return;
    try {
      this.almacen(tipo).setItem(clave, JSON.stringify(valor));
    } catch { /* navegador sin almacenamiento */ }
  }

  borrar(clave: string, tipo: 'local' | 'session' = 'local'): void {
    if (!this.enNavegador) return;
    try {
      this.almacen(tipo).removeItem(clave);
    } catch { /* nada */ }
  }

  private almacen(tipo: 'local' | 'session'): Storage {
    return tipo === 'local' ? localStorage : sessionStorage;
  }
}
