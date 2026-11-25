import { Component, Input } from '@angular/core';
import { Transformacion } from '../../../../core/models';
import { BeforeAfterComponent } from '../../../../shared/before-after/before-after.component';
import { RevealDirective } from '../../../../shared/reveal.directive';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';

/** Galería de antes/después: reutiliza <app-before-after> 6 veces */
@Component({
  standalone: true,
  selector: 'app-transformations',
  imports: [BeforeAfterComponent, RevealDirective, SectionHeaderComponent],
  template: `
    <section id="transformaciones">
      <div class="container">
        <app-section-header eyebrow="Resultados reales" titulo="Nuestras" destacado="transformaciones"
                            texto="Desliza para comparar el antes y el después." />
        <div class="grid-3">
          @for (t of items; track t.titulo; let i = $index) {
            <app-before-after data-reveal [style.--delay]="(i % 3) * 0.1 + 's'"
                              [titulo]="t.titulo" [descripcion]="t.descripcion"
                              [antes]="t.antes" [despues]="t.despues" />
          }
        </div>
      </div>
    </section>
  `
})
export class TransformationsComponent {
  @Input({ required: true }) items: Transformacion[] = [];
}
