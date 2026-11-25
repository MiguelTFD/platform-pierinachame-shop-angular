import { Component, inject, signal, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitaService } from '../../core/cita.service';
import { Cita } from '../../core/models';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';

/** Página "Tu cita está en camino" (antes: confirmacion.html) */
@Component({
  standalone: true,
  selector: 'app-confirmacion',
  imports: [SiteHeaderComponent, SiteFooterComponent, RouterLink],
  templateUrl: './confirmacion.component.html'
})
export class ConfirmacionComponent {
  private readonly citas = inject(CitaService);

  protected readonly cita = signal<Cita | null>(null);
  protected readonly enlaceWhatsapp = signal('#');

  constructor() {
    // los datos están en localStorage, que solo existe en el navegador
    afterNextRender(() => {
      const c = this.citas.ultima();
      if (!c) return;
      this.cita.set(c);
      this.enlaceWhatsapp.set(this.citas.enlaceWhatsapp(c));
    });
  }
}
