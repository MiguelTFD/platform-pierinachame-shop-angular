import { Component, HostListener, Input, afterNextRender, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ScrollSpyService } from '../../core/scroll-spy.service';

/**
 * Header reutilizable para todas las páginas de la web.
 * Cada página le pasa lo que cambia con @Input:
 *   <app-site-header [mostrarLogin]="true" />
 *   <app-site-header ctaTexto="Volver al inicio" ctaFragment="inicio" [ctaPrimario]="false" />
 */
@Component({
  standalone: true,
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html'
})
export class SiteHeaderComponent {
  @Input() mostrarLogin = false;
  @Input() ctaTexto = 'Reservar cita';
  @Input() ctaFragment = 'reservar';
  @Input() ctaPrimario = true;

  protected readonly spy = inject(ScrollSpyService);
  private readonly document = inject(DOCUMENT);

  protected readonly menuAbierto = signal(false);
  protected readonly conScroll = signal(false);

  constructor() {
    afterNextRender(() => this.conScroll.set(scrollY > 40));
  }

  @HostListener('window:scroll')
  alHacerScroll(): void {
    this.conScroll.set(scrollY > 40);
  }

  @HostListener('window:keydown.escape')
  alPresionarEscape(): void {
    this.abrirMenu(false);
  }

  @HostListener('window:resize')
  alCambiarTamano(): void {
    if (innerWidth > 900) this.abrirMenu(false);
  }

  protected abrirMenu(abrir: boolean): void {
    this.menuAbierto.set(abrir);
    // bloquea el scroll del fondo mientras el menú del celular está abierto
    this.document.body.classList.toggle('menu-open', abrir);
  }
}
