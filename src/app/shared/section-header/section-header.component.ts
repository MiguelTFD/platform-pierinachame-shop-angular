import { Component, Input } from '@angular/core';
import { RevealDirective } from '../reveal.directive';

/**
 * Encabezado de sección reutilizable.
 *   <app-section-header eyebrow="Catálogo" titulo="Nuestros" destacado="servicios"
 *                       texto="Desliza para ver cada categoría." />
 */
@Component({
  standalone: true,
  selector: 'app-section-header',
  imports: [RevealDirective],
  template: `
    <div class="section-header" data-reveal>
      <span class="eyebrow">{{ eyebrow }}</span>
      <h2>{{ titulo }} <em>{{ destacado }}</em></h2>
      @if (texto) {
        <p>{{ texto }}</p>
      }
    </div>
  `
})
export class SectionHeaderComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) titulo!: string;
  @Input() destacado = '';
  @Input() texto = '';
}
