import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { CitasService } from '../../../core/citas.service';
import { deISO, fechaCorta, hoyISO, soles } from '../../../core/fechas';
import { COMISION } from '../../../data/usuarios.data';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Comisiones de la profesional por mes */
@Component({
  standalone: true,
  selector: 'app-comisiones-view',
  template: `
    <div class="bar">
      <select class="campo" (change)="mes.set($any($event.target).value)" aria-label="Mes">
        @for (m of meses; track m.valor) { <option [value]="m.valor">{{ m.texto }}</option> }
      </select>
      <p>Comisión provisional: {{ porcentaje }} % de cada servicio atendido.</p>
    </div>

    <div class="stats">
      <div class="stat"><span>Servicios atendidos</span><b>{{ atendidas().length }}</b></div>
      <div class="stat"><span>Total vendido</span><b>{{ soles(vendido()) }}</b></div>
      <div class="stat"><span>Tu comisión</span><b>{{ soles(vendido() * comision) }}</b></div>
    </div>

    <div class="panel-box">
      <h2>Detalle</h2>
      @for (c of atendidas(); track c.id) {
        <div class="cita">
          <time>{{ fechaCorta(c.fecha) }}</time>
          <div class="cita-txt"><b>{{ c.servicio }}</b><span>{{ c.nombre }} · S/ {{ c.precio }}</span></div>
          <b>{{ soles(c.precio * comision) }}</b>
        </div>
      } @empty {
        <p class="mini">No hay servicios atendidos en este mes.</p>
      }
    </div>
  `
})
export class ComisionesViewComponent {
  private readonly auth = inject(AuthService);
  private readonly citas = inject(CitasService);

  protected readonly comision = COMISION;
  protected readonly porcentaje = COMISION * 100;
  protected readonly soles = soles;
  protected readonly fechaCorta = fechaCorta;

  protected readonly meses = [0, 1, 2].map((i) => {
    const d = deISO(hoyISO());
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return { valor: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, texto: `${MESES[d.getMonth()]} ${d.getFullYear()}` };
  });
  protected readonly mes = signal(this.meses[0].valor);

  protected readonly atendidas = computed(() => {
    const id = this.auth.sesion()?.profesionalId ?? '';
    return this.citas.lista()
      .filter((c) => c.profesionalId === id && c.estado === 'atendida' && c.fecha.startsWith(this.mes()))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  protected readonly vendido = computed(() => this.atendidas().reduce((t, c) => t + c.precio, 0));
}
