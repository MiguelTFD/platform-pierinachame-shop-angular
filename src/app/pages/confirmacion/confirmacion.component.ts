import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitasService } from '../../core/citas.service';
import { fechaLarga, horaAMPM } from '../../core/fechas';
import { Cita } from '../../core/models';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';


@Component({
  standalone: true,
  selector: 'app-confirmacion',
  imports: [SiteHeaderComponent, SiteFooterComponent, RouterLink],
  templateUrl: './confirmacion.component.html'
})
export class ConfirmacionComponent {
  private readonly citas = inject(CitasService);

  protected readonly cita = signal<Cita | null>(null);
  protected readonly enlaceWhatsapp = signal('#');
  protected readonly fechaLarga = fechaLarga;
  protected readonly horaAMPM = horaAMPM;

  constructor() {
    
    afterNextRender(() => {
      const c = this.citas.ultima();
      if (!c) return;
      this.cita.set(c);
      this.enlaceWhatsapp.set(this.citas.enlaceWhatsapp(c));
    });
  }
}
