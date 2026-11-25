import { Component } from '@angular/core';
import { WHATSAPP, WHATSAPP_TEXTO } from '../../data/sitio.data';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';


@Component({
  standalone: true,
  selector: 'app-contacto',
  imports: [SiteHeaderComponent, SiteFooterComponent, SectionHeaderComponent, RevealDirective],
  templateUrl: './contacto.component.html'
})
export class ContactoComponent {
  protected readonly whatsapp = WHATSAPP;
  protected readonly whatsappTexto = WHATSAPP_TEXTO;
}
