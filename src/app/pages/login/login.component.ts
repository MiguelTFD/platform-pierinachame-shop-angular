import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

/** Inicio de sesión (antes: login.html + js/login.js) */
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  host: { class: 'portal' },
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    clave: ['', Validators.required],
    recordar: [false]
  });

  protected readonly verClave = signal(false);
  protected readonly mostrarAyuda = signal(false);
  protected readonly enviado = signal(false);
  protected readonly cargando = signal(false);
  protected readonly entrando = signal(false);
  protected readonly errorGeneral = signal('');

  private readonly inputEmail = viewChild.required<ElementRef<HTMLInputElement>>('inputEmail');
  private readonly inputClave = viewChild.required<ElementRef<HTMLInputElement>>('inputClave');

  constructor() {
    // al escribir de nuevo, se borra el mensaje de error general
    this.form.valueChanges.subscribe(() => this.errorGeneral.set(''));
  }

  protected errorEmail(): string {
    const c = this.form.controls.email;
    if (!this.enviado() || !c.errors) return '';
    return c.errors['required'] ? 'Escribe tu correo.' : 'Revisa el correo: falta el @ o el dominio.';
  }

  protected errorClave(): string {
    const c = this.form.controls.clave;
    return this.enviado() && c.errors ? 'Escribe tu contraseña.' : '';
  }

  protected alternarClave(): void {
    this.verClave.update((v) => !v);
    this.inputClave().nativeElement.focus();
  }

  protected ingresar(): void {
    this.enviado.set(true);
    this.errorGeneral.set('');

    if (this.form.invalid) {
      (this.form.controls.email.invalid ? this.inputEmail() : this.inputClave()).nativeElement.focus();
      return;
    }

    const { email, clave, recordar } = this.form.getRawValue();
    this.cargando.set(true);

    // pequeña pausa para que se note que está validando (luego aquí irá el servidor)
    setTimeout(() => {
      const sesion = this.auth.login(email, clave, recordar);
      if (!sesion) {
        this.cargando.set(false);
        this.errorGeneral.set('El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.');
        this.inputClave().nativeElement.select();
        return;
      }
      this.entrando.set(true);
      this.router.navigateByUrl('/panel');
    }, 650);
  }
}
