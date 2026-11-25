import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CitasService } from '../../../../core/citas.service';
import {
  HORARIOS, HORA_CIERRE, fechaLarga, horaActual, horaAMPM, hoyISO, minutos, nombreDia, nombreMes, proximosDiasAbiertos, deISO
} from '../../../../core/fechas';
import { Profesional } from '../../../../core/models';
import { ProfesionalesService } from '../../../../core/profesionales.service';
import { ServiciosService } from '../../../../core/servicios.service';
import { HORARIO, MAPS_URL } from '../../../../data/sitio.data';
import { RevealDirective } from '../../../../shared/reveal.directive';

type EstadoAsiento = 'libre' | 'ocupado' | 'pasado';

interface Asiento {
  hora: string;
  texto: string;
  estado: EstadoAsiento;
}

const ASESORIA = 'Aún no lo sé · quiero asesoría';

function validarCelular(c: AbstractControl): ValidationErrors | null {
  const num = String(c.value ?? '');
  if (num.length !== 9) return null;
  if (!num.startsWith('9')) return { celular: 'El celular debe empezar con 9.' };
  const falso = /^(\d)\1+$/.test(num) || ['123456789', '987654321', '912345678', '998877665'].includes(num);
  return falso ? { celular: 'Ingresa un número de celular real.' } : null;
}

/**
 * Formulario de reserva con horario "tipo cine":
 * 1) día  2) horario (los ocupados salen bloqueados).
 * La clienta NO elige especialista: la cita se reparte sola y de forma justa
 * entre las trabajadoras de esa categoría que estén libres.
 */
@Component({
  standalone: true,
  selector: 'app-booking',
  imports: [ReactiveFormsModule, RevealDirective],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly citas = inject(CitasService);
  private readonly profesionales = inject(ProfesionalesService);
  private readonly serviciosSrv = inject(ServiciosService);
  private readonly router = inject(Router);

  protected readonly mapsUrl = MAPS_URL;
  protected readonly horario = HORARIO;
  protected readonly asesoria = ASESORIA;
  protected readonly dias = proximosDiasAbiertos(12);

  protected readonly modo = signal<'Cita para un servicio' | 'Solicitar evaluación'>('Cita para un servicio');
  protected readonly servicio = signal(ASESORIA);
  protected readonly dia = signal(this.dias[0]);
  protected readonly hora = signal('');
  protected readonly enviado = signal(false);
  protected readonly errorReserva = signal('');

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
    celular: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/), validarCelular]]
  });

  /* ---------- lo que se calcula solo (computed) ---------- */

  /** Servicios activos agrupados por categoría para el <select> */
  protected readonly grupos = computed(() => {
    const mapa = new Map<string, string[]>();
    this.serviciosSrv.activos().forEach((s) => mapa.set(s.cat, [...(mapa.get(s.cat) ?? []), s.nombre]));
    return [...mapa.entries()].map(([categoria, servicios]) => ({ categoria, servicios }));
  });

  private readonly servicioElegido = computed(() => this.serviciosSrv.porNombre(this.servicio()));
  protected readonly duracion = computed(() => this.servicioElegido()?.dur ?? 60);

  /** Las trabajadoras que hacen ese servicio (no se muestran a la clienta) */
  protected readonly candidatas = computed<Profesional[]>(() =>
    this.profesionales.deCategoria(this.servicioElegido()?.cat ?? ''));

  /** Los "asientos" del cine: cada horario con su estado */
  protected readonly franjas = computed(() => {
    const dia = this.dia();
    const dur = this.duracion();
    const ahora = dia === hoyISO() ? horaActual() : '';
    const candidatas = this.candidatas();
    this.citas.lista(); // para que se recalcule cuando cambian las citas

    const asientos: Asiento[] = HORARIOS.map((hora) => {
      let estado: EstadoAsiento = 'libre';
      if (ahora && hora <= ahora) estado = 'pasado';
      else if (minutos(hora) + dur > minutos(HORA_CIERRE) || !this.citas.hayLibre(candidatas, dia, hora, dur)) estado = 'ocupado';
      const [h, m] = hora.split(':').map(Number);
      return { hora, texto: `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`, estado };
    });

    return [
      { nombre: 'Mañana', asientos: asientos.filter((a) => a.hora < '12:00') },
      { nombre: 'Tarde', asientos: asientos.filter((a) => a.hora >= '12:00' && a.hora < '18:00') },
      { nombre: 'Noche', asientos: asientos.filter((a) => a.hora >= '18:00') }
    ];
  });

  protected readonly hayLibres = computed(() => this.franjas().some((f) => f.asientos.some((a) => a.estado === 'libre')));

  protected readonly resumen = computed(() => {
    if (!this.hora()) return '';
    return `${this.servicio() === ASESORIA ? 'Asesoría' : this.servicio()} · ${fechaLarga(this.dia())} · ${horaAMPM(this.hora())}`;
  });

  /* ---------- ayudas para el HTML ---------- */
  protected nombreDia = nombreDia;
  protected nombreMes = nombreMes;
  protected numeroDia(iso: string): number {
    return deISO(iso).getDate();
  }

  /* ---------- acciones ---------- */

  protected elegirServicio(e: Event): void {
    this.servicio.set((e.target as HTMLSelectElement).value);
    this.revisarHora();
  }

  protected elegirDia(iso: string): void {
    this.dia.set(iso);
    this.revisarHora();
  }

  protected elegirHora(a: Asiento): void {
    if (a.estado === 'libre') this.hora.set(a.hora);
  }

  /** Si el horario elegido ya no está libre, se borra */
  private revisarHora(): void {
    const h = this.hora();
    const sigueLibre = this.franjas().some((f) => f.asientos.some((a) => a.hora === h && a.estado === 'libre'));
    if (!sigueLibre) this.hora.set('');
  }

  /* solo letras en el nombre / solo 9 números en el celular */
  protected limpiarNombre(e: Event): void {
    const input = e.target as HTMLInputElement;
    const limpio = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    if (limpio !== input.value) this.form.controls.nombre.setValue(limpio);
  }

  protected limpiarCelular(e: Event): void {
    const input = e.target as HTMLInputElement;
    const limpio = input.value.replace(/[^0-9]/g, '').slice(0, 9);
    if (limpio !== input.value) this.form.controls.celular.setValue(limpio);
  }

  protected error(campo: 'nombre' | 'celular'): string {
    const c = this.form.controls[campo];
    if (!c.errors || !(c.touched || this.enviado())) return '';
    if (c.errors['required']) return campo === 'nombre' ? 'Escribe tu nombre.' : 'Escribe tu WhatsApp.';
    if (c.errors['pattern']) return campo === 'nombre' ? 'Solo se permiten letras.' : 'Debe tener exactamente 9 números.';
    return c.errors['celular'] ?? '';
  }

  protected enviar(): void {
    this.enviado.set(true);
    this.errorReserva.set('');
    if (this.form.invalid || !this.hora()) {
      this.form.markAllAsTouched();
      return;
    }

    const dur = this.duracion();
    const prof = this.citas.asignarJusta(this.candidatas(), this.dia(), this.hora(), dur);
    if (!prof) {
      this.errorReserva.set('Ese horario acaba de ocuparse. Elige otro, por favor.');
      this.hora.set('');
      return;
    }

    const v = this.form.getRawValue();
    const s = this.servicioElegido();
    const cita = this.citas.crear({
      modo: this.modo(),
      nombre: v.nombre.trim(),
      celular: v.celular,
      servicio: this.servicio(),
      categoria: s?.cat ?? '',
      profesionalId: prof.id,
      fecha: this.dia(),
      hora: this.hora(),
      duracion: dur,
      precio: s?.precio ?? 0,
      estado: 'pendiente',
      pago: null,
      origen: 'web'
    });
    this.citas.recordarUltima(cita.id);
    this.router.navigateByUrl('/confirmacion');
  }
}
