import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Aviso {
  id: number;
  titulo: string;
  texto: string;
}


@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly soportado = this.enNavegador && 'Notification' in window;
  readonly permiso = signal<NotificationPermission>(this.soportado ? Notification.permission : 'denied');

  /** Avisos que se ven dentro del panel (esquina inferior) */
  readonly avisos = signal<Aviso[]>([]);
  private contador = 0;

  async pedirPermiso(): Promise<void> {
    if (!this.soportado) return;
    const respuesta = await Notification.requestPermission();
    this.permiso.set(respuesta);
    if (respuesta === 'granted') {
      this.mostrar('¡Notificaciones activadas!', 'Te avisaremos cuando llegue una cita nueva.');
    }
  }

  /** Muestra el aviso en el panel y, si hay permiso, también como notificación del sistema */
  mostrar(titulo: string, texto: string): void {
    const id = ++this.contador;
    this.avisos.update((l) => [...l, { id, titulo, texto }]);
    setTimeout(() => this.cerrar(id), 8000);

    if (this.soportado && this.permiso() === 'granted') {
      try {
        new Notification(titulo, { body: texto, icon: 'favicon.ico', tag: 'cita-' + id });
      } catch {
        // En algunos celulares solo se permiten notificaciones con service worker; queda el aviso del panel.
      }
    }
  }

  cerrar(id: number): void {
    this.avisos.update((l) => l.filter((a) => a.id !== id));
  }
}
