import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FOTOS_HERO } from '../../../../data/sitio.data';

/** Portada con el carrusel de fotos (antes: activarCarruselHero) */
@Component({
  standalone: true,
  selector: 'app-hero',
  templateUrl: './hero.component.html'
})
export class HeroComponent {
  protected readonly fotos = FOTOS_HERO;
  protected readonly actual = signal(0);
  protected readonly avatares = ['AM', 'CR', 'VL', 'KS'];

  private readonly arco = viewChild.required<ElementRef<HTMLElement>>('arco');

  constructor() {
    const zona = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // fuera de la "zona" de Angular para no frenar el arranque de la app
      zona.runOutsideAngular(() => {
        // cambia de foto cada 3.5 segundos
        const timer = setInterval(() => this.actual.update((i) => (i + 1) % this.fotos.length), 3500);

        // el arco se inclina un poco siguiendo al mouse
        const inclinar = (e: PointerEvent) => {
          if (scrollY > innerHeight) return;
          const giroY = (e.clientX / innerWidth - 0.5) * 10;
          const giroX = (e.clientY / innerHeight - 0.5) * -8;
          this.arco().nativeElement.style.transform = `rotateY(${giroY}deg) rotateX(${giroX}deg)`;
        };
        const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (conMouse) addEventListener('pointermove', inclinar);

        destroyRef.onDestroy(() => {
          clearInterval(timer);
          removeEventListener('pointermove', inclinar);
        });
      });
    });
  }
}
