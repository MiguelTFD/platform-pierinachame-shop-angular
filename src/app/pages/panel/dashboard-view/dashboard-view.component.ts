import { Component, Input } from '@angular/core';
import { Sesion } from '../../../core/models';

/** Inicio del panel: saludo, números del día y próximas citas (datos de ejemplo) */
@Component({
  standalone: true,
  selector: 'app-dashboard-view',
  template: `
    <p class="hello">
      Hola, {{ primerNombre }}.
      {{ esProfesional ? 'Esto es lo que tienes hoy.' : 'Así va tu estudio hoy.' }}
      <em>(datos de ejemplo)</em>
    </p>

    <div class="stats">
      <div class="stat"><span>Citas de hoy</span><b>{{ esProfesional ? 3 : 8 }}</b></div>
      <div class="stat">
        <span>{{ esProfesional ? 'Clientas esta semana' : 'Clientas nuevas' }}</span>
        <b>{{ esProfesional ? 11 : 3 }}</b>
      </div>
      <div class="stat">
        <span>{{ esProfesional ? 'Comisión del mes' : 'Ingresos del día' }}</span>
        <b>S/ {{ esProfesional ? '860' : '1,240' }}</b>
      </div>
    </div>

    <div class="panel-box">
      <h2>Próximas citas</h2>
      @for (c of citas; track c.hora) {
        <div class="cita">
          <time>{{ c.hora }}</time>
          <div><b>{{ c.servicio }}</b><span>{{ c.detalle }}</span></div>
        </div>
      }
    </div>
  `
})
export class DashboardViewComponent {
  @Input({ required: true }) sesion: { nombre: string; rol: Sesion['rol'] } | null = null;

  protected readonly citas = [
    { hora: '9:00 a. m.', servicio: 'Microblading de cejas', detalle: 'Ana Torres · Marisol Díaz' },
    { hora: '11:30 a. m.', servicio: 'Manicure en gel', detalle: 'Carla Ruiz · Rosa Medina' },
    { hora: '3:00 p. m.', servicio: 'Extensiones de pestañas', detalle: 'Mía Salas · Lucía Paredes' }
  ];

  protected get primerNombre(): string {
    return this.sesion?.nombre.split(' ')[0] ?? '';
  }

  protected get esProfesional(): boolean {
    return this.sesion?.rol !== 'admin';
  }
}
