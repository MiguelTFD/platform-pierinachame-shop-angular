import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rol, Usuario } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { UsuariosService } from '../../../core/usuarios.service';
import { DrawerComponent } from '../../../shared/drawer/drawer.component';

/** Crear o editar una cuenta del panel (también sirve para restablecer contraseñas) */
@Component({
  standalone: true,
  selector: 'app-usuario-drawer',
  imports: [ReactiveFormsModule, DrawerComponent],
  template: `
    <app-drawer [abierto]="abierto" [titulo]="usuario ? 'Editar cuenta' : 'Nueva cuenta'" formId="usr-form" (cerrar)="cerrar.emit()">
      <form id="usr-form" ngNativeValidate [formGroup]="form" (ngSubmit)="guardar()">
        <div class="f">
          <label for="u-rol">Rol</label>
          <select id="u-rol" formControlName="rol" (change)="alCambiarRol()">
            <option value="profesional">Profesional</option>
            <option value="admin">Administradora</option>
          </select>
        </div>
        @if (form.controls.rol.value === 'profesional') {
          <div class="f">
            <label for="u-pro">Profesional vinculada</label>
            <select id="u-pro" formControlName="profesionalId" (change)="alElegirProfesional()" required>
              <option value="">Elige</option>
              @for (p of profesionales.lista(); track p.id) { <option [value]="p.id">{{ p.nombre }} ({{ p.especialidad }})</option> }
            </select>
          </div>
        }
        <div class="f"><label for="u-nombre">Nombre</label><input id="u-nombre" formControlName="nombre" required maxlength="50"></div>
        <div class="f"><label for="u-email">Correo</label><input id="u-email" type="email" formControlName="email" required autocomplete="off"></div>
        <div class="f">
          <label for="u-clave">{{ usuario ? 'Nueva contraseña (déjala vacía para no cambiarla)' : 'Contraseña' }}</label>
          <input id="u-clave" type="text" formControlName="clave" [required]="!usuario" minlength="6" autocomplete="off">
        </div>
        @if (error()) { <p class="form-aviso">{{ error() }}</p> }
      </form>
    </app-drawer>
  `
})
export class UsuarioDrawerComponent implements OnChanges {
  @Input() abierto = false;
  @Input() usuario: Usuario | null = null;
  @Output() cerrar = new EventEmitter<void>();

  protected readonly profesionales = inject(ProfesionalesService);
  private readonly usuarios = inject(UsuariosService);
  protected readonly error = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    rol: ['profesional' as Rol],
    profesionalId: [''],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    clave: ['']
  });

  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['abierto'] || !this.abierto) return;
    const u = this.usuario;
    this.form.reset({ rol: u?.rol ?? 'profesional', profesionalId: u?.profesionalId ?? '', nombre: u?.nombre ?? '', email: u?.email ?? '', clave: '' });
    this.error.set('');
  }

  protected alCambiarRol(): void {
    if (this.form.controls.rol.value === 'admin') this.form.controls.profesionalId.setValue('');
  }

  /** Al elegir la profesional, se copia su nombre */
  protected alElegirProfesional(): void {
    const p = this.profesionales.porId(this.form.controls.profesionalId.value);
    if (p) this.form.controls.nombre.setValue(p.nombre);
  }

  protected guardar(): void {
    const v = this.form.getRawValue();
    const email = v.email.trim().toLowerCase();
    const otro = this.usuarios.buscar(email);
    if (otro && otro.email !== this.usuario?.email) {
      this.error.set('Ya existe una cuenta con ese correo.');
      return;
    }
    if (v.rol === 'profesional' && !v.profesionalId) {
      this.error.set('Elige la profesional vinculada.');
      return;
    }
    this.usuarios.guardar({
      email, nombre: v.nombre.trim(), rol: v.rol,
      profesionalId: v.rol === 'profesional' ? v.profesionalId : '',
      clave: v.clave || this.usuario?.clave || ''
    }, this.usuario?.email);
    this.cerrar.emit();
  }
}
