import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * Brillo que sigue al mouse en las tarjetas (.card).
 * Usa @HostListener, como en tu guía.
 */
@Directive({ standalone: true,
  selector: '.card' })
export class SpotlightDirective {
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;

  @HostListener('pointermove', ['$event'])
  mover(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    const caja = this.el.getBoundingClientRect();
    this.el.style.setProperty('--mx', e.clientX - caja.left + 'px');
    this.el.style.setProperty('--my', e.clientY - caja.top + 'px');
  }
}
