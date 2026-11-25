import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { ScrollSpyService } from '../../core/scroll-spy.service';
import {
  CATEGORIAS, ESTADISTICAS, FILTROS_TESTIMONIOS, MARQUEE, PASOS, PREGUNTAS, TESTIMONIOS, TRANSFORMACIONES
} from '../../data/sitio.data';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';
import { BookingComponent } from './sections/booking/booking.component';
import { FaqComponent } from './sections/faq/faq.component';
import { HeroComponent } from './sections/hero/hero.component';
import { MarqueeComponent } from './sections/marquee/marquee.component';
import { ProcessComponent } from './sections/process/process.component';
import { ServicesSliderComponent } from './sections/services-slider/services-slider.component';
import { StatsComponent } from './sections/stats/stats.component';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { TransformationsComponent } from './sections/transformations/transformations.component';

/**
 * Página de inicio (antes: index.html).
 * Ya no tiene 570 líneas: solo junta los componentes de cada sección
 * y les pasa los datos con [ ].
 */
@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    SiteHeaderComponent, SiteFooterComponent, HeroComponent, MarqueeComponent, StatsComponent,
    ServicesSliderComponent, ProcessComponent, TransformationsComponent, TestimonialsComponent,
    FaqComponent, BookingComponent
  ],
  template: `
    <app-site-header [mostrarLogin]="true" />

    <app-hero />
    <app-marquee [items]="marquee" />
    <app-stats [datos]="estadisticas" />
    <app-services-slider [categorias]="categorias" />
    <app-process [pasos]="pasos" />
    <app-transformations [items]="transformaciones" />
    <app-testimonials [testimonios]="testimonios" [filtros]="filtros" />
    <app-faq [grupos]="preguntas" />
    <!-- ngSkipHydration: la reserva lee datos del navegador (citas y equipo), así que se dibuja solo en el navegador -->
    <app-booking ngSkipHydration />

    <app-site-footer />
  `
})
export class HomeComponent {
  protected readonly marquee = MARQUEE;
  protected readonly estadisticas = ESTADISTICAS;
  protected readonly categorias = CATEGORIAS;
  protected readonly pasos = PASOS;
  protected readonly transformaciones = TRANSFORMACIONES;
  protected readonly testimonios = TESTIMONIOS;
  protected readonly filtros = FILTROS_TESTIMONIOS;
  protected readonly preguntas = PREGUNTAS;

  constructor() {
    const spy = inject(ScrollSpyService);
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    // Avisa al header qué sección se está viendo (antes: activarEnlaceActivo)
    afterNextRender(() => {
      const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => { if (e.isIntersecting) spy.seccionActiva.set(e.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      host.querySelectorAll('section[id]').forEach((s: Element) => observador.observe(s));

      destroyRef.onDestroy(() => {
        observador.disconnect();
        spy.seccionActiva.set('');
      });
    });
  }
}
