import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../../core/citas.service';
import { fechaCorta, horaAMPM, hoyISO } from '../../../core/fechas';
import { Cita, EstadoCita } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { CitaDrawerComponent } from '../drawers/cita-drawer.component';

type Rango = 'proximas' | 'hoy' | 'pasadas' | 'todas';

/** Lista de citas con filtros, cambio de estado y WhatsApp */
@Component({
  standalone: true,
  selector: 'app-citas-view',
  imports: [AvatarComponent, CitaDrawerComponent],
  template: `
    <div class="bar">
      <div class="filtros">
        <input class="campo" type="search" placeholder="Buscar clienta o servicio" [value]="texto()" (input)="texto.set(valor($event))">
        <select class="campo" [value]="rango()" (change)="rango.set($any(valor($event)))" aria-label="Rango">
          <option value="proximas">Próximas</option>
          <option value="hoy">Hoy</option>
          <option value="pasadas">Pasadas</option>
          <option value="todas">Todas</option>
        </select>
        <select class="campo" (change)="estado.set(valor($event))" aria-label="Estado">
          <option value="">Todos los estados</option>
          @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
        </select>
        <select class="campo" (change)="pro.set(valor($event))" aria-label="Profesional">
          <option value="">Todas las profesionales</option>
          @for (p of profesionales.lista(); track p.id) { <option [value]="p.id">{{ p.nombre }}</option> }
        </select>
      </div>
      <button class="btn-sm" type="button" (click)="abrir(null)"><i class="fa-solid fa-plus"></i> Nueva cita</button>
    </div>

    <p class="mini">{{ filtradas().length }} citas</p>
    @if (filtradas().length) {
      <div class="table-wrap">
        <table class="tabla-movil">
          <thead>
            <tr><th>Día y hora</th><th>Clienta</th><th>Servicio</th><th>Profesional</th><th>Estado</th><th><span class="sr">Acciones</span></th></tr>
          </thead>
          <tbody>
            @for (c of filtradas(); track c.id) {
              <tr>
                <td data-label="Día y hora"><b>{{ fechaCorta(c.fecha) }}</b><br><span class="mini">{{ horaAMPM(c.hora) }}</span></td>
                <td data-label="Clienta">{{ c.nombre }}<br><span class="mini">{{ c.celular }}</span></td>
                <td data-label="Servicio">{{ c.servicio }}<br><span class="mini">{{ c.duracion }} min · S/ {{ c.precio }}</span></td>
                <td data-label="Profesional">
                  <span class="fila-avatar">
                    <app-avatar [nombre]="nombrePro(c)" [foto]="fotoPro(c)" [tamano]="28" />{{ nombrePro(c) }}
                  </span>
                </td>
                <td data-label="Estado">
                  <select [class]="'campo estado-select estado-' + c.estado" [value]="c.estado"
                          (change)="cambiarEstado(c, $event)" [attr.aria-label]="'Estado de la cita de ' + c.nombre">
                    @for (e of estados; track e) { <option [value]="e" [selected]="e === c.estado">{{ e }}</option> }
                  </select>
                </td>
                <td class="acc">
                  <a class="icon-btn" [href]="citas.enlaceClienta(c)" target="_blank" rel="noopener" [attr.aria-label]="'WhatsApp a ' + c.nombre">
                    <i class="fa-brands fa-whatsapp"></i>
                  </a>
                  <button class="icon-btn" type="button" [attr.aria-label]="'Editar cita de ' + c.nombre" (click)="abrir(c)">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="icon-btn" type="button" [attr.aria-label]="'Eliminar cita de ' + c.nombre" (click)="eliminar(c)">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="empty"><i class="fa-regular fa-calendar"></i><h2>Sin citas</h2><p>No hay citas con esos filtros.</p></div>
    }

    <app-cita-drawer [abierto]="abierto()" [cita]="seleccionada()" (cerrar)="abierto.set(false)" />
  `
})
export class CitasViewComponent {
  protected readonly citas = inject(CitasService);
  protected readonly profesionales = inject(ProfesionalesService);

  protected readonly estados: EstadoCita[] = ['pendiente', 'confirmada', 'atendida', 'cancelada'];
  protected readonly fechaCorta = fechaCorta;
  protected readonly horaAMPM = horaAMPM;

  protected readonly texto = signal('');
  protected readonly rango = signal<Rango>('proximas');
  protected readonly estado = signal('');
  protected readonly pro = signal('');
  protected readonly abierto = signal(false);
  protected readonly seleccionada = signal<Cita | null>(null);

  protected readonly filtradas = computed(() => {
    const hoy = hoyISO();
    const t = this.texto().trim().toLowerCase();
    const r = this.rango();
    const lista = this.citas.lista().filter((c) =>
      (r === 'todas' || (r === 'hoy' && c.fecha === hoy) || (r === 'proximas' && c.fecha >= hoy) || (r === 'pasadas' && c.fecha < hoy)) &&
      (!this.estado() || c.estado === this.estado()) &&
      (!this.pro() || c.profesionalId === this.pro()) &&
      (!t || c.nombre.toLowerCase().includes(t) || c.servicio.toLowerCase().includes(t) || c.celular.includes(t)));
    const orden = (a: Cita, b: Cita) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora);
    return r === 'pasadas' || r === 'todas' ? lista.sort((a, b) => orden(b, a)) : lista.sort(orden);
  });

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected nombrePro(c: Cita): string {
    return this.profesionales.nombre(c.profesionalId);
  }

  protected fotoPro(c: Cita): string {
    return this.profesionales.porId(c.profesionalId)?.foto ?? '';
  }

  protected cambiarEstado(c: Cita, e: Event): void {
    this.citas.cambiarEstado(c.id, this.valor(e) as EstadoCita);
  }

  protected abrir(c: Cita | null): void {
    this.seleccionada.set(c);
    this.abierto.set(true);
  }

  protected eliminar(c: Cita): void {
    if (window.confirm(`¿Eliminar la cita de ${c.nombre} (${c.servicio})?`)) this.citas.eliminar(c.id);
  }
}
