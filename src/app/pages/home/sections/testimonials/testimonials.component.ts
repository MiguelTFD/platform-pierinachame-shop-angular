import { Component, Input, signal } from '@angular/core';
import { Testimonio } from '../../../../core/models';
import { RevealDirective } from '../../../../shared/reveal.directive';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';
import { SpotlightDirective } from '../../../../shared/spotlight.directive';

/** Testimonios con pestañas para filtrar (antes: activarPestanasTestimonios) */
@Component({
  standalone: true,
  selector: 'app-testimonials',
  imports: [RevealDirective, SectionHeaderComponent, SpotlightDirective],
  template: `
    <section class="dark" id="testimonios">
      <div class="container">
        <app-section-header eyebrow="Testimonios" titulo="Lo que dicen" destacado="nuestras clientas" />

        <div class="tabs" data-reveal>
          @for (f of filtros; track f.id) {
            <button type="button" class="tab" [class.on]="filtro() === f.id" (click)="filtro.set(f.id)">
              {{ f.texto }}
            </button>
          }
        </div>

        <div class="grid-3 reviews-grid">
          @for (t of testimonios; track t.autora; let i = $index) {
            <div class="card review" data-reveal [style.--delay]="(i % 3) * 0.1 + 's'"
                 [class.hidden]="!seMuestra(t)">
              <div class="stars">★★★★★</div>
              <p>“{{ t.texto }}”</p>
              <div class="author"><i>{{ t.iniciales }}</i>{{ t.autora }}</div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class TestimonialsComponent {
  @Input({ required: true }) testimonios: Testimonio[] = [];
  @Input({ required: true }) filtros: { id: string; texto: string }[] = [];

  protected readonly filtro = signal('todas');

  protected seMuestra(t: Testimonio): boolean {
    return this.filtro() === 'todas' || t.categorias.includes(this.filtro());
  }
}
