import { Component, Input } from '@angular/core';
import { RevealDirective } from '../../../../shared/reveal.directive';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';

/** "Cómo trabajamos": los pasos numerados */
@Component({
  standalone: true,
  selector: 'app-process',
  imports: [RevealDirective, SectionHeaderComponent],
  template: `
    <section class="dark" id="proceso">
      <div class="container">
        <app-section-header eyebrow="Proceso" titulo="Cómo" destacado="trabajamos" />
        <div class="steps">
          @for (paso of pasos; track paso; let i = $index) {
            <div class="step" data-reveal [style.--delay]="i * 0.1 + 's'"><b>{{ i + 1 }}</b>{{ paso }}</div>
          }
        </div>
      </div>
    </section>
  `
})
export class ProcessComponent {
  @Input({ required: true }) pasos: string[] = [];
}
