import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CORREO, MAPS_URL, WHATSAPP, WHATSAPP_TEXTO } from '../../data/sitio.data';

/** Footer reutilizable: se escribe una vez y lo usan todas las páginas */
@Component({
  standalone: true,
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div>
            <a routerLink="/" fragment="inicio" class="logo">Pierina <span>Chame</span></a>
            <p>Somos un Estudio, especializado en cejas, pestañas y micropigmentación
              <i class="fa-solid fa-heart footer-heart" aria-hidden="true"></i></p>
          </div>
          <div>
            <h4>Visítanos</h4>
            <ul>
              <li><a [href]="mapsUrl" target="_blank" rel="noopener">Av. Francisco Irazola, Satipo (Ver mapa)</a></li>
              <li>Junín, Perú</li>
            </ul>
          </div>
          <div>
            <h4>Horario</h4>
            <ul>
              <li>Lunes a sábado</li>
              <li>09:00 a.m. – 9:00 p.m.</li>
            </ul>
          </div>
          <div>
            <h4>Escríbenos</h4>
            <ul>
              <li><a [href]="'https://wa.me/' + whatsapp" target="_blank" rel="noopener">WhatsApp: {{ whatsappTexto }}</a></li>
              <li><a [href]="'mailto:' + correo">{{ correo }}</a></li>
            </ul>
          </div>
        </div>
        <p class="copyright">© {{ anio }} Pierina Chame Studio · Todos los derechos reservados</p>
      </div>
    </footer>
  `
})
export class SiteFooterComponent {
  protected readonly mapsUrl = MAPS_URL;
  protected readonly whatsapp = WHATSAPP;
  protected readonly whatsappTexto = WHATSAPP_TEXTO;
  protected readonly correo = CORREO;
  protected readonly anio = new Date().getFullYear();
}
