import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../../core/citas.service';
import { HORARIOS, fechaLarga, horaAMPM, hoyISO, minutos, sumarDias } from '../../../core/fechas';
import { Cita } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { CitaDrawerComponent } from '../drawers/cita-drawer.component';

const ALTO_FILA = 34;      // px por cada media hora
const INICIO = 9 * 60;     // 9:00

/** Agenda del día: una columna por profesional y las citas como bloques */
@Component({
  standalone: true,
  selector: 'app-agenda-view',
  imports: [AvatarComponent, CitaDrawerComponent],
  template: `
    <div class="bar">
      <div class="dia-nav">
        <button class="icon-btn" type="button" aria-label="Día anterior" (click)="mover(-1)"><i class="fa-solid fa-chevron-left"></i></button>
        <input class="campo" type="date" [value]="fecha()" (change)="elegir($event)" aria-label="Fecha">
        <button class="icon-btn" type="button" aria-label="Día siguiente" (click)="mover(1)"><i class="fa-solid fa-chevron-right"></i></button>
        <button class="btn-sm btn-ghost" type="button" (click)="fecha.set(hoy)">Hoy</button>
        <p>{{ fechaLarga(fecha()) }} · {{ delDia().length }} citas</p>
      </div>
      <button class="btn-sm" type="button" (click)="abrir(null)"><i class="fa-solid fa-plus"></i> Nueva cita</button>
    </div>

    <div class="agenda" [style.--cols]="profesionales.activas().length">
      <div class="agenda-head">
        <span></span>
        @for (p of profesionales.activas(); track p.id) {
          <div class="agenda-pro"><app-avatar [nombre]="p.nombre" [foto]="p.foto" [tamano]="32" /><b>{{ p.nombre }}</b></div>
        }
      </div>
      <div class="agenda-body" [style.height.px]="horarios.length * alto">
        <div class="agenda-horas">
          @for (h of horarios; track h) { <span [style.height.px]="alto">{{ h.endsWith(':00') ? horaAMPM(h) : '' }}</span> }
        </div>
        @for (p of profesionales.activas(); track p.id) {
          <div class="agenda-col" [style.background-size]="'100% ' + alto + 'px'">
            @for (c of dePro(p.id); track c.id) {
              <button type="button" [class]="'agenda-cita estado-' + c.estado"
                      [style.top.px]="top(c)" [style.height.px]="alto * c.duracion / 30 - 3" (click)="abrir(c)">
                <b>{{ horaAMPM(c.hora) }} · {{ c.servicio }}</b>
                <span>{{ c.nombre }}</span>
              </button>
            }
          </div>
        }
      </div>
    </div>
    <p class="mini">Haz clic en una cita para editarla o cambiar su estado.</p>

    <app-cita-drawer [abierto]="abierto()" [cita]="seleccionada()" [fechaInicial]="fecha()" (cerrar)="abierto.set(false)" />
  `
})
export class AgendaViewComponent {
  protected readonly profesionales = inject(ProfesionalesService);
  private readonly citas = inject(CitasService);

  protected readonly hoy = hoyISO();
  protected readonly horarios = HORARIOS;
  protected readonly alto = ALTO_FILA;
  protected readonly fechaLarga = fechaLarga;
  protected readonly horaAMPM = horaAMPM;

  protected readonly fecha = signal(this.hoy);
  protected readonly abierto = signal(false);
  protected readonly seleccionada = signal<Cita | null>(null);

  protected readonly delDia = computed(() =>
    this.citas.lista().filter((c) => c.fecha === this.fecha() && c.estado !== 'cancelada'));

  protected dePro(id: string): Cita[] {
    return this.delDia().filter((c) => c.profesionalId === id);
  }

  protected top(c: Cita): number {
    return ((minutos(c.hora) - INICIO) / 30) * ALTO_FILA + 1;
  }

  protected mover(dias: number): void {
    this.fecha.update((f) => sumarDias(f, dias));
  }

  protected elegir(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v) this.fecha.set(v);
  }

  protected abrir(c: Cita | null): void {
    this.seleccionada.set(c);
    this.abierto.set(true);
  }
}
