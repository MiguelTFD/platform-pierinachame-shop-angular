import { Component, Input } from '@angular/core';
import { Estadistica } from '../../../../core/models';
import { CountUpDirective } from '../../../../shared/count-up.directive';
import { RevealDirective } from '../../../../shared/reveal.directive';

/** Números animados (150+ clientas, 5 ★, ...) */
@Component({
  standalone: true,
  selector: 'app-stats',
  imports: [CountUpDirective, RevealDirective],
  template: `
    <section class="stats-section">
      <div class="container stats">
        @for (s of datos; track s.texto; let i = $index) {
          <div data-reveal [style.--delay]="i * 0.1 + 's'">
            <b [appCountUp]="s.valor" [decimales]="s.decimales ?? 0">0</b><span>{{ s.texto }}</span>
          </div>
        }
      </div>
    </section>
  `
})
export class StatsComponent {
  @Input({ required: true }) datos: Estadistica[] = [];
}
