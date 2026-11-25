import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { Usuario } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { UsuariosService } from '../../../core/usuarios.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { UsuarioDrawerComponent } from '../drawers/usuario-drawer.component';

/** Cuentas del panel y su rol */
@Component({
  standalone: true,
  selector: 'app-usuarios-view',
  imports: [AvatarComponent, UsuarioDrawerComponent],
  template: `
    <div class="bar">
      <p>Cada profesional entra con su cuenta y solo ve su agenda, sus clientas y sus comisiones.</p>
      <button class="btn-sm" type="button" (click)="abrir(null)"><i class="fa-solid fa-plus"></i> Nueva cuenta</button>
    </div>

    <div class="table-wrap">
      <table class="tabla-movil">
        <thead><tr><th>Persona</th><th>Correo</th><th>Rol</th><th><span class="sr">Acciones</span></th></tr></thead>
        <tbody>
          @for (u of usuarios.lista(); track u.email) {
            <tr>
              <td data-label="Persona">
                <span class="fila-avatar">
                  <app-avatar [nombre]="u.nombre" [foto]="foto(u)" [tamano]="34" /><b>{{ u.nombre }}</b>
                </span>
              </td>
              <td data-label="Correo">{{ u.email }}</td>
              <td data-label="Rol"><span class="tag" [class.on]="u.rol === 'admin'">{{ etiqueta(u) }}</span></td>
              <td class="acc">
                <button class="icon-btn" type="button" [attr.aria-label]="'Editar cuenta de ' + u.nombre" (click)="abrir(u)"><i class="fa-solid fa-pen"></i></button>
                <button class="icon-btn" type="button" [attr.aria-label]="'Eliminar cuenta de ' + u.nombre"
                        [disabled]="u.email === auth.sesion()?.email" (click)="eliminar(u)"><i class="fa-regular fa-trash-can"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <p class="mini">¿Alguien olvidó su contraseña? Edita su cuenta y escribe una nueva.</p>

    <app-usuario-drawer [abierto]="abierto()" [usuario]="seleccionado()" (cerrar)="abierto.set(false)" />
  `
})
export class UsuariosViewComponent {
  protected readonly usuarios = inject(UsuariosService);
  protected readonly auth = inject(AuthService);
  private readonly profesionales = inject(ProfesionalesService);

  protected readonly abierto = signal(false);
  protected readonly seleccionado = signal<Usuario | null>(null);

  protected foto(u: Usuario): string {
    return this.profesionales.porId(u.profesionalId)?.foto ?? '';
  }

  protected etiqueta(u: Usuario): string {
    return u.rol === 'admin' ? 'Administradora' : this.profesionales.porId(u.profesionalId)?.especialidad ?? 'Profesional';
  }

  protected abrir(u: Usuario | null): void {
    this.seleccionado.set(u);
    this.abierto.set(true);
  }

  protected eliminar(u: Usuario): void {
    if (window.confirm(`¿Eliminar la cuenta de ${u.nombre}? Ya no podrá entrar al panel.`)) this.usuarios.eliminar(u.email);
  }
}
