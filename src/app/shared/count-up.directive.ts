import { Directive, ElementRef, Input, afterNextRender, inject } from '@angular/core';

/**
 * Contador animado (antes: animarContador en script.js).
 *   <b [appCountUp]="150"></b>
 *   <b [appCountUp]="5" [decimales]="1"></b>
 */
@Directive({ standalone: true,
  selector: '[appCountUp]' })
export class CountUpDirective {
  @Input({ required: true }) appCountUp = 0;
  @Input() decimales = 0;

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;

  constructor() {
    afterNextRender(() => {
      this.el.textContent = (0).toFixed(this.decimales);
      const observador = new IntersectionObserver((entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        observador.disconnect();
        this.animar();
      }, { threshold: 0.6 });
      observador.observe(this.el);
    });
  }

  private animar(): void {
    const final = this.appCountUp;
    const duracion = 1800;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const valor = final * (1 - Math.pow(1 - progreso, 3));
      this.el.textContent = valor.toFixed(this.decimales);
      if (progreso < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }
}
