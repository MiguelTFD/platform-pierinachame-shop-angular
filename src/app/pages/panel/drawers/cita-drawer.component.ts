import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CitasService } from '../../../core/citas.service';
import { HORARIOS, horaAMPM, hoyISO } from '../../../core/fechas';
import { Cita, EstadoCita } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { ServiciosService } from '../../../core/servicios.service';
import { DrawerComponent } from '../../../shared/drawer/drawer.component';

/** Crear o editar una cita desde el panel (lo usan Agenda y Citas) */
@Component({
  standalone: true,
  selector: 'app-cita-drawer',
  imports: [ReactiveFormsModule, DrawerComponent],
  template: `
    <app-drawer [abierto]="abierto" [titulo]="cita ? 'Editar cita' : 'Nueva cita'" formId="cita-form" (cerrar)="cerrar.emit()">
      <form id="cita-form" ngNativeValidate [formGroup]="form" (ngSubmit)="guardar()">
        @if (cita) { <p class="code">Código: <b>{{ cita.id }}</b> · pedida desde {{ cita.origen === 'web' ? 'la web' : 'el panel' }}</p> }
        <div class="row2">
          <div class="f">
            <label for="c-nombre">Clienta</label>
            <input id="c-nombre" formControlName="nombre" required maxlength="60" placeholder="Nombre y apellido">
          </div>
          <div class="f">
            <label for="c-cel">Celular</label>
            <input id="c-cel" formControlName="celular" required pattern="9[0-9]{8}" maxlength="9" inputmode="numeric" placeholder="9XXXXXXXX">
          </div>
        </div>
        <div class="f">
          <label for="c-srv">Servicio</label>
          <select id="c-srv" formControlName="servicio" required>
            <option value="">Elige un servicio</option>
            @for (s of servicios.activos(); track s.id) {
              <option [value]="s.nombre">{{ s.nombre }} · {{ s.dur }} min · S/ {{ s.precio }}</option>
            }
          </select>
        </div>
        <div class="f">
          <label for="c-pro">Profesional</label>
          <select id="c-pro" formControlName="profesionalId" required>
            <option value="">Elige una profesional</option>
            @for (p of candidatas(); track p.id) {
              <option [value]="p.id">{{ p.nombre }} ({{ p.especialidad }})</option>
            }
          </select>
        </div>
        <div class="row2">
          <div class="f">
            <label for="c-fecha">Día</label>
            <input id="c-fecha" type="date" formControlName="fecha" required>
          </div>
          <div class="f">
            <label for="c-hora">Hora</label>
            <select id="c-hora" formControlName="hora" required>
              <option value="">Elige</option>
              @for (h of horasLibres(); track h) {
                <option [value]="h">{{ horaAMPM(h) }}</option>
              }
            </select>
          </div>
        </div>
        @if (form.controls.profesionalId.value && form.controls.fecha.value && !horasLibres().length) {
          <p class="form-aviso">Esta profesional no tiene horarios libres ese día.</p>
        }
        <div class="f">
          <label for="c-estado">Estado</label>
          <select id="c-estado" formControlName="estado">
            @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
          </select>
        </div>
      </form>
    </app-drawer>
  `
})
export class CitaDrawerComponent implements OnChanges {
  @Input() abierto = false;
  @Input() cita: Cita | null = null;
  @Input() fechaInicial = '';
  @Output() cerrar = new EventEmitter<void>();

  protected readonly servicios = inject(ServiciosService);
  private readonly profesionales = inject(ProfesionalesService);
  private readonly citas = inject(CitasService);
  protected readonly horaAMPM = horaAMPM;
  protected readonly estados: EstadoCita[] = ['pendiente', 'confirmada', 'atendida', 'cancelada'];

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', Validators.required],
    celular: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]],
    servicio: ['', Validators.required],
    profesionalId: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    estado: ['confirmada' as EstadoCita]
  });

  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['abierto'] || !this.abierto) return;
    const c = this.cita;
    this.form.reset({
      nombre: c?.nombre ?? '', celular: c?.celular ?? '', servicio: c?.servicio ?? '',
      profesionalId: c?.profesionalId ?? '', fecha: c?.fecha ?? (this.fechaInicial || hoyISO()),
      hora: c?.hora ?? '', estado: c?.estado ?? 'confirmada'
    });
  }

  /** Profesionales que hacen el servicio elegido */
  protected candidatas() {
    const cat = this.servicios.porNombre(this.form.controls.servicio.value)?.cat ?? '';
    return this.profesionales.deCategoria(cat);
  }

  /** Horas libres para esa profesional ese día (al editar, su propia hora cuenta como libre) */
  protected horasLibres(): string[] {
    const { profesionalId, fecha, servicio } = this.form.getRawValue();
    if (!profesionalId || !fecha) return [];
    const dur = this.servicios.porNombre(servicio)?.dur ?? 60;
    return HORARIOS.filter((h) => this.citas.estaLibre(profesionalId, fecha, h, dur, this.cita?.id ?? ''));
  }

  protected guardar(): void {
    const v = this.form.getRawValue();
    const s = this.servicios.porNombre(v.servicio);
    if (!this.candidatas().some((p) => p.id === v.profesionalId)) {
      this.form.controls.profesionalId.setValue('');
      return;
    }
    if (!s || !this.horasLibres().includes(v.hora)) {
      this.form.controls.hora.setValue('');
      return;
    }
    const datos = {
      nombre: v.nombre.trim(), celular: v.celular, servicio: s.nombre, categoria: s.cat,
      profesionalId: v.profesionalId, fecha: v.fecha, hora: v.hora, duracion: s.dur, precio: s.precio, estado: v.estado
    };
    if (this.cita) {
      this.citas.actualizar(this.cita.id, datos);
    } else {
      this.citas.crear({ ...datos, modo: 'Cita para un servicio', pago: null, origen: 'panel' });
    }
    this.cerrar.emit();
  }
}
