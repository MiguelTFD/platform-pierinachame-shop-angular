import { Component, Input, signal } from '@angular/core';

/**
 * Comparador antes / después (antes: activarComparadores en script.js).
 *   <app-before-after titulo="Cejas" descripcion="..." antes="img/a.png" despues="img/b.png" />
 */
@Component({
  standalone: true,
  selector: 'app-before-after',
  host: { class: 'transformation' },
  template: `
    <div class="compare" [style.--split]="split() + '%'">
      <div class="before" [style.background-image]="'url(' + antes + ')'"><span>Antes</span></div>
      <div class="after" [style.background-image]="'url(' + despues + ')'"><span>Después</span></div>
      <i></i>
      <input type="range" min="0" max="100" [value]="split()"
             (input)="mover($event)" aria-label="Comparar antes y después">
    </div>
    <h3>{{ titulo }}</h3>
    <p>{{ descripcion }}</p>
  `
})
export class BeforeAfterComponent {
  @Input({ required: true }) titulo!: string;
  @Input() descripcion = '';
  @Input({ required: true }) antes!: string;
  @Input({ required: true }) despues!: string;

  protected readonly split = signal(50);

  protected mover(e: Event): void {
    this.split.set(Number((e.target as HTMLInputElement).value));
  }
}
