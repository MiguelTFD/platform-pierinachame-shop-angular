import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService } from '../../../../core/cita.service';
import { HORARIO, MAPS_URL, TODOS_LOS_SERVICIOS } from '../../../../data/sitio.data';
import { RevealDirective } from '../../../../shared/reveal.directive';

const DIAS_CERRADO = [0];        // 0 = domingo
const HORA_APERTURA = '09:00';
const HORA_CIERRE = '21:00';

function fechaLocalHoy(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/* ---------- validadores (antes: activarReglasFechaHora) ---------- */

const validarCelular: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const num = String(c.value ?? '');
  if (num.length !== 9) return null; // de esto se encarga el pattern
  if (!num.startsWith('9')) return { celular: 'El celular debe empezar con 9.' };
  const falso = /^(\d)\1+$/.test(num) || ['123456789', '987654321', '912345678', '998877665'].includes(num);
  return falso ? { celular: 'Ingresa un número de celular real.' } : null;
};

function validarFecha(hoy: string): ValidatorFn {
  return (c) => {
    const fecha = String(c.value ?? '');
    if (!fecha) return null; // la fecha es opcional
    const finDeAnio = hoy.slice(0, 4) + '-12-31';
    const [a, m, d] = fecha.split('-').map(Number);
    if (fecha < hoy) return { fecha: 'Elige una fecha desde hoy en adelante.' };
    if (fecha > finDeAnio) return { fecha: `Solo puedes reservar dentro del año ${hoy.slice(0, 4)}.` };
    if (DIAS_CERRADO.includes(new Date(a, m - 1, d).getDay())) return { fecha: 'Atendemos de lunes a sábado. Elige otro día.' };
    return null;
  };
}

/** Pasa hora + min + am/pm a "HH:MM" (24 h) */
function hora24(h: string, min: string, ampm: string): string | null {
  if (!h || !min || !ampm) return null;
  let hh = Number(h) % 12;
  if (ampm === 'PM') hh += 12;
  return String(hh).padStart(2, '0') + ':' + min;
}

function validarHora(hoy: string): ValidatorFn {
  return (grupo) => {
    const v = grupo.value as { fecha: string; hora: string; min: string; ampm: string };
    const t = hora24(v.hora, v.min, v.ampm);
    if (!t) return null; // sin hora = "Por confirmar"
    if (t < HORA_APERTURA || t > HORA_CIERRE) return { hora: 'Atendemos de 9:00 a.m. a 9:00 p.m. Elige una hora dentro de ese horario.' };
    if (v.fecha === hoy && t <= new Date().toTimeString().slice(0, 5)) return { hora: 'Esa hora ya pasó. Elige una más tarde.' };
    return null;
  };
}

/** Formulario de reserva + mapa */
@Component({
  standalone: true,
  selector: 'app-booking',
  imports: [ReactiveFormsModule, RevealDirective],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly citas = inject(CitaService);
  private readonly router = inject(Router);

  protected readonly servicios = TODOS_LOS_SERVICIOS;
  protected readonly horas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  protected readonly minutos = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  protected readonly mapsUrl = MAPS_URL;
  protected readonly horario = HORARIO;

  protected readonly hoy = fechaLocalHoy();
  protected readonly finDeAnio = this.hoy.slice(0, 4) + '-12-31';

  protected readonly modo = signal<'Cita para un servicio' | 'Solicitar evaluación'>('Cita para un servicio');
  protected readonly enviado = signal(false);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
    celular: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/), validarCelular]],
    servicio: ['Aún no lo sé · quiero asesoría'],
    fecha: ['', validarFecha(this.hoy)],
    hora: [''],
    min: [''],
    ampm: ['']
  }, { validators: validarHora(this.hoy) });

  /* solo letras en el nombre */
  protected limpiarNombre(e: Event): void {
    const input = e.target as HTMLInputElement;
    const limpio = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    if (limpio !== input.value) this.form.controls.nombre.setValue(limpio);
  }

  /* solo números en el celular, máximo 9 */
  protected limpiarCelular(e: Event): void {
    const input = e.target as HTMLInputElement;
    const limpio = input.value.replace(/[^0-9]/g, '').slice(0, 9);
    if (limpio !== input.value) this.form.controls.celular.setValue(limpio);
  }

  /** Mensaje de error de un campo (solo si ya lo tocaste o intentaste enviar) */
  protected error(campo: 'nombre' | 'celular' | 'fecha'): string {
    const c = this.form.controls[campo];
    if (!c.errors || !(c.touched || this.enviado())) return '';
    if (c.errors['required']) return campo === 'nombre' ? 'Escribe tu nombre.' : 'Escribe tu WhatsApp.';
    if (c.errors['pattern']) return campo === 'nombre' ? 'Solo se permiten letras.' : 'Debe tener exactamente 9 números.';
    return c.errors['celular'] ?? c.errors['fecha'] ?? '';
  }

  protected errorHora(): string {
    return this.form.errors?.['hora'] ?? '';
  }

  protected enviar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const hora = v.hora && v.min && v.ampm ? `${v.hora}:${v.min} ${v.ampm === 'AM' ? 'a.m.' : 'p.m.'}` : 'Por confirmar';

    this.citas.guardar({
      modo: this.modo(),
      nombre: v.nombre.trim(),
      celular: v.celular,
      servicio: v.servicio,
      fecha: v.fecha || 'Por confirmar',
      hora
    });
    this.router.navigateByUrl('/confirmacion');
  }
}
