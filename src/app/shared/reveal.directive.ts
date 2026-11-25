import { Directive, ElementRef, afterNextRender, inject, signal } from '@angular/core';


@Directive({
  standalone: true,
  selector: '[data-reveal]',
  host: { '[class.visible]': 'visible()' }
})
export class RevealDirective {
  protected readonly visible = signal(false);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement;

    
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) {
        this.visible.set(true);
        return;
      }
      const observador = new IntersectionObserver((entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          this.visible.set(true);
          observador.disconnect();
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
      observador.observe(el);
    });
  }
}
