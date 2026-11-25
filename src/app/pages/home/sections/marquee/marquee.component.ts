import { Component, Input } from '@angular/core';

/**
 * Cinta de texto que se desplaza sola.
 * Repetimos la lista 2 veces para que la animación no tenga cortes.
 *   <app-marquee [items]="['Manicure', 'Pedicure']" />
 */
@Component({
  standalone: true,
  selector: 'app-marquee',
  template: `
    <div class="marquee">
      <div>
        @for (item of items; track $index) {
          <span>{{ item }}</span>
        }
        @for (item of items; track $index) {
          <span aria-hidden="true">{{ item }}</span>
        }
      </div>
    </div>
  `
})
export class MarqueeComponent {
  @Input({ required: true }) items: string[] = [];
}
