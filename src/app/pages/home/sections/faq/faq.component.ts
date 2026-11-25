import { Component, Input, signal } from '@angular/core';
import { GrupoPreguntas } from '../../../../core/models';
import { RevealDirective } from '../../../../shared/reveal.directive';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';

/** Preguntas frecuentes: solo una abierta a la vez (antes: activarPreguntas) */
@Component({
  standalone: true,
  selector: 'app-faq',
  imports: [RevealDirective, SectionHeaderComponent],
  template: `
    <section class="faq" id="preguntas">
      <div class="container">
        <app-section-header eyebrow="Ayuda" titulo="Preguntas" destacado="frecuentes"
                            texto="Respuestas sobre reservas, evaluación y servicios." />
        <div class="faq-wrap">
          @for (g of grupos; track g.titulo) {
            <div class="faq-group" data-reveal>
              <span class="eyebrow">{{ g.titulo }}</span>
              @for (p of g.preguntas; track p.pregunta) {
                <div class="faq-item" [class.open]="abierta() === p.pregunta">
                  <button type="button" [attr.aria-expanded]="abierta() === p.pregunta"
                          (click)="alternar(p.pregunta)">{{ p.pregunta }}</button>
                  <div class="faq-answer">
                    <div><p>{{ p.respuesta }}</p></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class FaqComponent {
  @Input({ required: true }) grupos: GrupoPreguntas[] = [];

  protected readonly abierta = signal<string | null>(null);

  protected alternar(pregunta: string): void {
    this.abierta.update((actual) => (actual === pregunta ? null : pregunta));
  }
}
