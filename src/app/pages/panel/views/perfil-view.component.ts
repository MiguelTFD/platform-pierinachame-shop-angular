import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { UsuariosService } from '../../../core/usuarios.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';

/** Perfil de la profesional + cambio de contraseña */
@Component({
  standalone: true,
  selector: 'app-perfil-view',
  imports: [AvatarComponent],
  template: `
    <div class="panel-grid-2">
      <div class="panel-box perfil">
        <app-avatar [nombre]="auth.nombre()" [foto]="auth.profesional()?.foto ?? ''" [tamano]="112" />
        <h2>{{ auth.nombre() }}</h2>
        <p class="mini">{{ auth.profesional()?.especialidad }}</p>
        <div class="chips">
          @for (c of auth.profesional()?.categorias ?? []; track c) { <span class="chip">{{ c }}</span> }
        </div>
        <p class="mini">{{ auth.sesion()?.email }}</p>
        <p class="mini">Tu nombre y tu foto los actualiza la administradora en <b>Profesionales</b>.</p>
      </div>

      <form class="panel-box form-simple" (submit)="cambiar($event, actual, nueva, repetir)">
        <h2>Cambiar contraseña</h2>
        <label>Contraseña actual<input class="campo" type="password" #actual required autocomplete="current-password"></label>
        <label>Nueva contraseña<input class="campo" type="password" #nueva required minlength="6" autocomplete="new-password"></label>
        <label>Repite la nueva<input class="campo" type="password" #repetir required minlength="6" autocomplete="new-password"></label>
        @if (mensaje()) { <p [class]="ok() ? 'form-ok' : 'form-aviso'">{{ mensaje() }}</p> }
        <button class="btn-sm" type="submit">Guardar contraseña</button>
      </form>
    </div>
  `
})
export class PerfilViewComponent {
  protected readonly auth = inject(AuthService);
  private readonly usuarios = inject(UsuariosService);
  protected readonly mensaje = signal('');
  protected readonly ok = signal(false);

  protected cambiar(e: Event, actual: HTMLInputElement, nueva: HTMLInputElement, repetir: HTMLInputElement): void {
    e.preventDefault();
    const email = this.auth.sesion()?.email ?? '';
    const u = this.usuarios.buscar(email);
    this.ok.set(false);
    if (!u || u.clave !== actual.value) return this.mensaje.set('La contraseña actual no es correcta.');
    if (nueva.value.length < 6) return this.mensaje.set('La nueva contraseña debe tener al menos 6 caracteres.');
    if (nueva.value !== repetir.value) return this.mensaje.set('Las contraseñas nuevas no coinciden.');
    this.usuarios.cambiarClave(email, nueva.value);
    this.ok.set(true);
    this.mensaje.set('¡Listo! Tu contraseña se cambió.');
    actual.value = nueva.value = repetir.value = '';
  }
}
