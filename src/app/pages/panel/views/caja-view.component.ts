import { Component, computed, inject, signal } from '@angular/core';
import { CitasService } from '../../../core/citas.service';
import { fechaCorta, horaAMPM, hoyISO, inicioSemana, soles } from '../../../core/fechas';
import { Cita, MetodoPago } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';

/** Caja: lo cobrado y lo que falta cobrar */
@Component({
  standalone: true,
  selector: 'app-caja-view',
  template: `
    <div class="stats">
      <div class="stat"><span>Cobrado hoy</span><b>{{ soles(total(hoy, hoy)) }}</b></div>
      <div class="stat"><span>Cobrado esta semana</span><b>{{ soles(total(semana, hoy)) }}</b></div>
      <div class="stat"><span>Cobrado este mes</span><b>{{ soles(total(mes + '-01', hoy)) }}</b></div>
      <div class="stat"><span>Por cobrar</span><b>{{ soles(porCobrarTotal()) }}</b></div>
    </div>

    <div class="panel-box">
      <div class="cat-sub">
        <h2>Por cobrar</h2>
        <label class="check">
          <input type="checkbox" [checked]="conProximas()" (change)="conProximas.set(!conProximas())">
          <span>Incluir citas de días siguientes (adelantos)</span>
        </label>
      </div>
      <p class="mini">
        {{ conProximas() ? 'Todas las citas sin pago, también las que aún no llegan.' : 'Citas de hoy o días anteriores que aún no tienen pago. Las de días siguientes se ven en Agenda y Citas.' }}
      </p>
      @if (porCobrar().length) {
        <div class="table-wrap plano">
          <table class="tabla-movil">
            <thead><tr><th>Día</th><th>Clienta</th><th>Servicio</th><th>Profesional</th><th>Monto</th><th>Método</th><th></th></tr></thead>
            <tbody>
              @for (c of porCobrar(); track c.id) {
                <tr>
                  <td data-label="Día">{{ fechaCorta(c.fecha) }}<br><span class="mini">{{ horaAMPM(c.hora) }}</span></td>
                  <td data-label="Clienta">{{ c.nombre }}</td>
                  <td data-label="Servicio">{{ c.servicio }}</td>
                  <td data-label="Profesional">{{ profesionales.nombre(c.profesionalId) }}</td>
                  <td data-label="Monto"><b>S/ {{ c.precio }}</b></td>
                  <td data-label="Método">
                    <select class="campo" #metodo [attr.aria-label]="'Método de pago de ' + c.nombre">
                      @for (m of metodos; track m) { <option [value]="m">{{ m }}</option> }
                    </select>
                  </td>
                  <td class="acc"><button class="btn-sm" type="button" (click)="cobrar(c, metodo.value)">Cobrar</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="mini">Todo está cobrado. 🎉</p>
      }
    </div>

    <div class="panel-grid-2">
      <div class="panel-box">
        <h2>Este mes por método</h2>
        @for (m of porMetodo(); track m.metodo) {
          <div class="barra-fila">
            <span>{{ m.metodo }}</span>
            <div class="barra"><i [style.width.%]="m.porcentaje"></i></div>
            <b>{{ soles(m.total) }}</b>
          </div>
        }
      </div>
      <div class="panel-box">
        <h2>Últimos pagos</h2>
        @for (c of ultimosPagos(); track c.id) {
          <div class="cita">
            <time>{{ fechaCorta(c.pago!.fecha) }}</time>
            <div class="cita-txt"><b>{{ c.nombre }}</b><span>{{ c.servicio }} · {{ c.pago!.metodo }}</span></div>
            <b>S/ {{ c.pago!.monto }}</b>
          </div>
        } @empty {
          <p class="mini">Aún no hay pagos.</p>
        }
      </div>
    </div>
  `
})
export class CajaViewComponent {
  private readonly citas = inject(CitasService);
  protected readonly profesionales = inject(ProfesionalesService);

  protected readonly metodos: MetodoPago[] = ['Efectivo', 'Yape', 'Plin', 'Tarjeta'];
  protected readonly hoy = hoyISO();
  protected readonly semana = inicioSemana(this.hoy);
  protected readonly mes = this.hoy.slice(0, 7);
  protected readonly soles = soles;
  protected readonly fechaCorta = fechaCorta;
  protected readonly horaAMPM = horaAMPM;

  /** Si está marcado, también se pueden cobrar citas futuras (adelantos) */
  protected readonly conProximas = signal(false);

  private readonly pagadas = computed(() => this.citas.lista().filter((c) => c.pago));

  protected readonly porCobrar = computed(() =>
    this.citas.lista()
      .filter((c) => !c.pago && c.estado !== 'cancelada' && (this.conProximas() || c.fecha <= this.hoy) && c.precio > 0)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)));

  protected readonly porCobrarTotal = computed(() => this.porCobrar().reduce((t, c) => t + c.precio, 0));

  protected readonly ultimosPagos = computed(() =>
    [...this.pagadas()].sort((a, b) => (b.pago!.fecha + b.hora).localeCompare(a.pago!.fecha + a.hora)).slice(0, 8));

  protected readonly porMetodo = computed(() => {
    const delMes = this.pagadas().filter((c) => c.pago!.fecha.startsWith(this.mes));
    const totales = this.metodos.map((metodo) => ({
      metodo, total: delMes.filter((c) => c.pago!.metodo === metodo).reduce((t, c) => t + c.pago!.monto, 0)
    }));
    const max = Math.max(1, ...totales.map((t) => t.total));
    return totales.map((t) => ({ ...t, porcentaje: (t.total / max) * 100 }));
  });

  protected total(desde: string, hasta: string): number {
    return this.pagadas()
      .filter((c) => c.pago!.fecha >= desde && c.pago!.fecha <= hasta)
      .reduce((t, c) => t + c.pago!.monto, 0);
  }

  protected cobrar(c: Cita, metodo: string): void {
    this.citas.cobrar(c.id, metodo as MetodoPago);
  }
}
