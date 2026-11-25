import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../../core/citas.service';
import { deISO, hoyISO, soles } from '../../../core/fechas';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

interface Barra { nombre: string; valor: number; texto: string; porcentaje: number; foto?: string }

function barras(datos: { nombre: string; valor: number; foto?: string }[], formato: (n: number) => string): Barra[] {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  return [...datos].sort((a, b) => b.valor - a.valor)
    .map((d) => ({ ...d, texto: formato(d.valor), porcentaje: (d.valor / max) * 100 }));
}

/** Reportes del mes: ingresos, citas y servicios más pedidos */
@Component({
  standalone: true,
  selector: 'app-reportes-view',
  imports: [AvatarComponent],
  template: `
    <div class="bar">
      <select class="campo" (change)="mes.set($any($event.target).value)" aria-label="Mes">
        @for (m of meses; track m.valor) { <option [value]="m.valor">{{ m.texto }}</option> }
      </select>
      <p>Solo cuenta citas atendidas y pagos registrados.</p>
    </div>

    <div class="stats">
      <div class="stat"><span>Ingresos</span><b>{{ soles(ingresos()) }}</b></div>
      <div class="stat"><span>Citas atendidas</span><b>{{ atendidas().length }}</b></div>
      <div class="stat"><span>Ticket promedio</span><b>{{ soles(ticket()) }}</b></div>
      <div class="stat"><span>Cancelaciones</span><b>{{ cancelacion() }} %</b></div>
    </div>

    <div class="panel-grid-2">
      <div class="panel-box">
        <h2>Ingresos por categoría</h2>
        @for (b of porCategoria(); track b.nombre) {
          <div class="barra-fila"><span>{{ b.nombre }}</span><div class="barra"><i [style.width.%]="b.porcentaje"></i></div><b>{{ b.texto }}</b></div>
        } @empty { <p class="mini">Sin datos este mes.</p> }
      </div>
      <div class="panel-box">
        <h2>Citas por profesional</h2>
        @for (b of porProfesional(); track b.nombre) {
          <div class="barra-fila">
            <span class="fila-avatar"><app-avatar [nombre]="b.nombre" [foto]="b.foto ?? ''" [tamano]="26" />{{ b.nombre }}</span>
            <div class="barra"><i [style.width.%]="b.porcentaje"></i></div><b>{{ b.texto }}</b>
          </div>
        } @empty { <p class="mini">Sin datos este mes.</p> }
      </div>
    </div>

    <div class="panel-box">
      <h2>Servicios más pedidos</h2>
      @for (b of topServicios(); track b.nombre) {
        <div class="barra-fila"><span>{{ b.nombre }}</span><div class="barra"><i [style.width.%]="b.porcentaje"></i></div><b>{{ b.texto }}</b></div>
      } @empty { <p class="mini">Sin datos este mes.</p> }
    </div>
  `
})
export class ReportesViewComponent {
  private readonly citas = inject(CitasService);
  private readonly profesionales = inject(ProfesionalesService);
  protected readonly soles = soles;

  /** Este mes y los 2 anteriores */
  protected readonly meses = [0, 1, 2].map((i) => {
    const d = deISO(hoyISO());
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { valor, texto: `${MESES[d.getMonth()]} ${d.getFullYear()}` };
  });
  protected readonly mes = signal(this.meses[0].valor);

  private readonly delMes = computed(() => this.citas.lista().filter((c) => c.fecha.startsWith(this.mes())));
  protected readonly atendidas = computed(() => this.delMes().filter((c) => c.estado === 'atendida'));
  protected readonly ingresos = computed(() => this.atendidas().reduce((t, c) => t + (c.pago?.monto ?? 0), 0));
  protected readonly ticket = computed(() => Math.round(this.ingresos() / Math.max(1, this.atendidas().filter((c) => c.pago).length)));
  protected readonly cancelacion = computed(() => {
    const total = this.delMes().length;
    return total ? Math.round((this.delMes().filter((c) => c.estado === 'cancelada').length / total) * 100) : 0;
  });

  protected readonly porCategoria = computed(() => {
    const mapa = new Map<string, number>();
    this.atendidas().forEach((c) => mapa.set(c.categoria || 'Sin categoría', (mapa.get(c.categoria || 'Sin categoría') ?? 0) + (c.pago?.monto ?? 0)));
    return barras([...mapa].map(([nombre, valor]) => ({ nombre, valor })), soles);
  });

  protected readonly porProfesional = computed(() =>
    barras(this.profesionales.lista().map((p) => ({
      nombre: p.nombre, foto: p.foto, valor: this.atendidas().filter((c) => c.profesionalId === p.id).length
    })), (n) => `${n} citas`));

  protected readonly topServicios = computed(() => {
    const mapa = new Map<string, number>();
    this.atendidas().forEach((c) => mapa.set(c.servicio, (mapa.get(c.servicio) ?? 0) + 1));
    return barras([...mapa].map(([nombre, valor]) => ({ nombre, valor })), (n) => `${n}`).slice(0, 5);
  });
}
