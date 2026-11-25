import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Marco de la web pública (inicio, contacto, confirmación).
 * Pone la barra de progreso y la luz del cursor UNA sola vez,
 * y dentro de <router-outlet> se muestra la página que toca.
 */
@Component({
  standalone: true,
  selector: 'app-site-layout',
  imports: [RouterOutlet],
  host: { class: 'site' },
  template: `
    <div id="progress-bar" #barra></div>
    <div id="cursor-glow" #luz></div>
    <router-outlet />
  `
})
export class SiteLayoutComponent {
  private readonly barra = viewChild.required<ElementRef<HTMLElement>>('barra');
  private readonly luz = viewChild.required<ElementRef<HTMLElement>>('luz');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const barra = this.barra().nativeElement;
      const luz = this.luz().nativeElement;

      const pintarBarra = () => {
        const total = document.documentElement.scrollHeight - innerHeight;
        barra.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
      };
      const moverLuz = (e: PointerEvent) => {
        luz.style.left = e.clientX + 'px';
        luz.style.top = e.clientY + 'px';
      };

      addEventListener('scroll', pintarBarra, { passive: true });
      pintarBarra();

      const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (conMouse) addEventListener('pointermove', moverLuz);

      // al salir de la web (ir al login), quitamos los listeners
      destroyRef.onDestroy(() => {
        removeEventListener('scroll', pintarBarra);
        removeEventListener('pointermove', moverLuz);
      });
    });
  }
}
