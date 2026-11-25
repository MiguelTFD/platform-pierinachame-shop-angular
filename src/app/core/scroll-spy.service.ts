import { Injectable, signal } from '@angular/core';

/**
 * Guarda qué sección de la página de inicio se está viendo,
 * para que el header pinte ese enlace (clase "on").
 * Es un ejemplo de servicio que comparte información entre componentes.
 */
@Injectable({ providedIn: 'root' })
export class ScrollSpyService {
  readonly seccionActiva = signal<string>('');
}
