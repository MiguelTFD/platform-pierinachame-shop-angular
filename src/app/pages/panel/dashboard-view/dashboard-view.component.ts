import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { CitasService } from '../../../core/citas.service';
import { fechaCorta, horaAMPM, hoyISO, inicioSemana, soles, sumarDias } from '../../../core/fechas';
import { Cita } from '../../../core/models';
import { ProductosService } from '../../../core/productos.service';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { COMISION } from '../../../data/usuarios.data';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';

/** Inicio del panel. La administradora ve todo el estudio; cada profesional, solo lo suyo. */
@Component({
  standalone: true,
  selector: 'app-dashboard-view',
  imports: [AvatarComponent],
  template: `
    <p class="hello">
      Hola, {{ primerNombre() }}.
      {{ auth.esAdmin() ? 'Así va tu estudio hoy, ' : 'Esto es lo que tienes hoy, ' }}{{ fechaCorta(hoy) }}.
    </p>

    <div class="stats">
      <div class="stat"><span>Citas de hoy</span><b>{{ deHoy().length }}</b></div>
      @if (auth.esAdmin()) {
        <div class="stat"><span>Por confirmar</span><b>{{ porConfirmar() }}</b></div>
        <div class="stat"><span>Cobrado hoy</span><b>{{ soles(cobradoHoy()) }}</b></div>
        <div class="stat"><span>Productos con stock bajo</span><b>{{ productos.stockBajo().length }}</b></div>
      } @else {
        <div class="stat"><span>Clientas esta semana</span><b>{{ clientasSemana() }}</b></div>
        <div class="stat"><span>Comisión del mes</span><b>{{ soles(comisionMes()) }}</b></div>
      }
    </div>

    <div class="panel-box">
      <h2>Citas de hoy</h2>
      @for (c of deHoy(); track c.id) {
        <div class="cita">
          <time>{{ horaAMPM(c.hora) }}</time>
          @if (auth.esAdmin()) {
            <app-avatar [nombre]="prof(c).nombre" [foto]="prof(c).foto" [tamano]="36" />
          }
          <div class="cita-txt">
            <b>{{ c.servicio }}</b>
            <span>{{ c.nombre }} · {{ c.categoria || 'Asesoría' }} · {{ asignada(c) }} · {{ c.duracion }} min</span>
          </div>
          <span class="estado" [class]="'estado estado-' + c.estado">{{ c.estado }}</span>
        </div>
      } @empty {
        <p class="mini">No hay citas para hoy.</p>
      }
    </div>

    <div class="panel-box">
      <h2>Próximos días</h2>
      @for (c of proximas(); track c.id) {
        <div class="cita">
          <time>{{ fechaCorta(c.fecha) }}<br><small>{{ horaAMPM(c.hora) }}</small></time>
          <div class="cita-txt">
            <b>{{ c.servicio }}</b>
            <span>{{ c.nombre }} · {{ c.categoria || 'Asesoría' }} · {{ asignada(c) }}</span>
          </div>
          <span [class]="'estado estado-' + c.estado">{{ c.estado }}</span>
        </div>
      } @empty {
        <p class="mini">No hay citas en los próximos días.</p>
      }
    </div>
  `
})
export class DashboardViewComponent {
  protected readonly auth = inject(AuthService);
  protected readonly productos = inject(ProductosService);
  private readonly citas = inject(CitasService);
  private readonly profesionales = inject(ProfesionalesService);

  protected readonly hoy = hoyISO();
  protected readonly fechaCorta = fechaCorta;
  protected readonly horaAMPM = horaAMPM;
  protected readonly soles = soles;

  protected readonly primerNombre = computed(() => this.auth.nombre().split(' ')[0]);

  /** Administradora: todas. Trabajadora: solo las de sus categorías. Sin las canceladas. */
  private readonly visibles = computed(() =>
    this.citas.lista().filter((c) => c.estado !== 'cancelada' && this.auth.puedeVer(c)));

  protected readonly deHoy = computed(() =>
    this.visibles().filter((c) => c.fecha === this.hoy).sort((a, b) => a.hora.localeCompare(b.hora)));

  protected readonly proximas = computed(() => {
    const limite = sumarDias(this.hoy, 7);
    return this.visibles()
      .filter((c) => c.fecha > this.hoy && c.fecha <= limite)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
      .slice(0, 8);
  });

  protected readonly porConfirmar = computed(() =>
    this.citas.lista().filter((c) => c.estado === 'pendiente' && c.fecha >= this.hoy).length);

  protected readonly cobradoHoy = computed(() =>
    this.citas.lista().reduce((t, c) => t + (c.pago?.fecha === this.hoy ? c.pago.monto : 0), 0));

  protected readonly clientasSemana = computed(() => {
    const desde = inicioSemana(this.hoy);
    const hasta = sumarDias(desde, 6);
    return new Set(this.visibles().filter((c) => c.fecha >= desde && c.fecha <= hasta).map((c) => c.celular)).size;
  });

  protected readonly comisionMes = computed(() => {
    const mes = this.hoy.slice(0, 7);
    const id = this.auth.sesion()?.profesionalId ?? '';
    return this.visibles()
      .filter((c) => c.estado === 'atendida' && c.fecha.startsWith(mes) && c.profesionalId === id)
      .reduce((t, c) => t + c.precio * COMISION, 0);
  });

  /** "Te toca a ti" para la trabajadora, o el nombre de quien la atiende */
  protected asignada(c: Cita): string {
    return c.profesionalId === this.auth.sesion()?.profesionalId ? 'te toca a ti' : this.prof(c).nombre;
  }

  protected prof(c: Cita): { nombre: string; foto: string } {
    return this.profesionales.porId(c.profesionalId) ?? { nombre: 'Sin asignar', foto: '' };
  }
}
