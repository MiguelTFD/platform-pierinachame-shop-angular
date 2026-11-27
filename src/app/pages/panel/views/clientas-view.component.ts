import { Component, Input, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../../core/citas.service';
import { fechaCorta, hoyISO, soles } from '../../../core/fechas';
import { AuthService } from '../../../core/auth.service';

interface Clienta {
  nombre: string;
  celular: string;
  visitas: number;
  ultima: string;
  proxima: string;
  gastado: number;
}

/** Clientas (salen de las citas). La trabajadora solo ve las de sus categorías. */
@Component({
  standalone: true,
  selector: 'app-clientas-view',
  template: `
    <div class="bar">
      <input class="campo" type="search" placeholder="Buscar por nombre o celular" (input)="texto.set($any($event.target).value)">
      <p>{{ filtradas().length }} clientas</p>
    </div>

    <div class="table-wrap">
      <table class="tabla-movil">
        <thead><tr><th>Clienta</th><th>Visitas</th><th>Última visita</th><th>Próxima cita</th><th>Total</th><th></th></tr></thead>
        <tbody>
          @for (c of filtradas(); track c.celular) {
            <tr>
              <td data-label="Clienta"><b>{{ c.nombre }}</b><br><span class="mini">{{ c.celular }}</span></td>
              <td data-label="Visitas">{{ c.visitas }}</td>
              <td data-label="Última visita">{{ c.ultima ? fechaCorta(c.ultima) : '—' }}</td>
              <td data-label="Próxima cita">{{ c.proxima ? fechaCorta(c.proxima) : '—' }}</td>
              <td data-label="Total">{{ soles(c.gastado) }}</td>
              <td class="acc">
                <a class="icon-btn" [href]="'https://wa.me/51' + c.celular" target="_blank" rel="noopener" [attr.aria-label]="'WhatsApp a ' + c.nombre">
                  <i class="fa-brands fa-whatsapp"></i>
                </a>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="mini">No se encontraron clientas.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ClientasViewComponent {
  /** true en "Mis clientas" de la profesional */
  @Input() soloMias = false;

  private readonly citas = inject(CitasService);
  private readonly auth = inject(AuthService);
  protected readonly fechaCorta = fechaCorta;
  protected readonly soles = soles;
  protected readonly texto = signal('');

  private readonly clientas = computed<Clienta[]>(() => {
    const hoy = hoyISO();
    const mapa = new Map<string, Clienta>();
    this.citas.lista()
      .filter((c) => !this.soloMias || this.auth.puedeVer(c))
      .forEach((c) => {
        const k = mapa.get(c.celular) ?? { nombre: c.nombre, celular: c.celular, visitas: 0, ultima: '', proxima: '', gastado: 0 };
        if (c.estado === 'atendida') {
          k.visitas++;
          k.gastado += c.pago?.monto ?? 0;
          if (c.fecha > k.ultima) k.ultima = c.fecha;
        }
        if (c.fecha >= hoy && c.estado !== 'cancelada' && c.estado !== 'atendida' && (!k.proxima || c.fecha < k.proxima)) k.proxima = c.fecha;
        k.nombre = c.nombre;
        mapa.set(c.celular, k);
      });
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  protected readonly filtradas = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return this.clientas().filter((c) => !t || c.nombre.toLowerCase().includes(t) || c.celular.includes(t));
  });
}
