import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriasService } from '../../../core/categorias.service';
import { Profesional } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { UsuariosService } from '../../../core/usuarios.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { DrawerComponent } from '../../../shared/drawer/drawer.component';

/** Crear o editar una profesional: foto, nombre, especialidad y categorías */
@Component({
  standalone: true,
  selector: 'app-profesional-drawer',
  imports: [ReactiveFormsModule, DrawerComponent, AvatarComponent],
  template: `
    <app-drawer [abierto]="abierto" [titulo]="profesional ? 'Editar profesional' : 'Nueva profesional'"
                formId="pro-form" (cerrar)="cerrar.emit()">
      <form id="pro-form" ngNativeValidate [formGroup]="form" (ngSubmit)="guardar()">

        <!-- Foto -->
        <div class="foto-editor">
          <app-avatar [nombre]="form.controls.nombre.value || '?'" [foto]="foto()" [tamano]="104" />
          <div>
            <label class="btn-sm btn-ghost foto-btn">
              <i class="fa-solid fa-camera"></i> {{ foto() ? 'Cambiar foto' : 'Subir foto' }}
              <input type="file" accept="image/*" (change)="elegirFoto($event)" hidden>
            </label>
            @if (foto()) {
              <button type="button" class="link-btn" (click)="foto.set('')">Quitar foto</button>
            }
            <p class="mini">JPG o PNG. Se ajusta sola a un tamaño pequeño.</p>
            @if (errorFoto()) { <p class="form-aviso">{{ errorFoto() }}</p> }
          </div>
        </div>

        <div class="f">
          <label for="p-nombre">Nombre</label>
          <input id="p-nombre" formControlName="nombre" required maxlength="50" placeholder="Ej. Rosa Medina">
        </div>
        <div class="row2">
          <div class="f">
            <label for="p-esp">Especialidad</label>
            <input id="p-esp" formControlName="especialidad" required maxlength="40" placeholder="Ej. Manicurista">
          </div>
          <div class="f">
            <label for="p-cel">Celular</label>
            <input id="p-cel" formControlName="celular" maxlength="9" inputmode="numeric" placeholder="9XXXXXXXX">
          </div>
        </div>

        <!-- Casillas: una profesional puede hacer varias tareas -->
        <fieldset class="cat-opciones">
          <legend>¿Qué tareas hace? <span>Marca todas las que correspondan</span></legend>
          <div class="cat-grid">
            @for (c of categorias.lista(); track c) {
              <label class="cat-op" [class.on]="elegidas().includes(c)">
                <input type="checkbox" [checked]="elegidas().includes(c)" (change)="alternar(c)">
                <span class="cat-caja" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                <span class="cat-txt">{{ c }}</span>
                <span class="cat-si" aria-hidden="true">{{ elegidas().includes(c) ? 'Sí' : 'No' }}</span>
              </label>
            }
          </div>
          <p class="mini">{{ elegidas().length }} de {{ categorias.lista().length }} tareas marcadas</p>
          @if (intento() && !elegidas().length) { <p class="form-aviso">Marca al menos una tarea.</p> }
        </fieldset>

        <label class="check"><input type="checkbox" formControlName="activo"><span>Activa (aparece en la web para reservar)</span></label>
      </form>
    </app-drawer>
  `
})
export class ProfesionalDrawerComponent implements OnChanges {
  @Input() abierto = false;
  @Input() profesional: Profesional | null = null;
  @Output() cerrar = new EventEmitter<void>();

  protected readonly categorias = inject(CategoriasService);
  private readonly profesionales = inject(ProfesionalesService);
  private readonly usuarios = inject(UsuariosService);

  protected readonly foto = signal('');
  protected readonly elegidas = signal<string[]>([]);
  protected readonly intento = signal(false);
  protected readonly errorFoto = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', Validators.required],
    especialidad: ['', Validators.required],
    celular: [''],
    activo: [true]
  });

  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['abierto'] || !this.abierto) return;
    const p = this.profesional;
    this.form.reset({ nombre: p?.nombre ?? '', especialidad: p?.especialidad ?? '', celular: p?.celular ?? '', activo: p?.activo ?? true });
    this.foto.set(p?.foto ?? '');
    this.elegidas.set(p?.categorias ?? []);
    this.intento.set(false);
    this.errorFoto.set('');
  }

  protected alternar(c: string): void {
    this.elegidas.update((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));
  }

  protected async elegirFoto(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      this.errorFoto.set('Ese archivo no es una imagen.');
      return;
    }
    try {
      this.foto.set(await this.profesionales.leerFoto(archivo));
      this.errorFoto.set('');
    } catch {
      this.errorFoto.set('No se pudo leer la imagen. Prueba con otra.');
    }
  }

  protected guardar(): void {
    this.intento.set(true);
    if (this.form.invalid || !this.elegidas().length) return;
    const v = this.form.getRawValue();
    const datos = {
      nombre: v.nombre.trim(), especialidad: v.especialidad.trim(), celular: v.celular.trim(),
      activo: v.activo, foto: this.foto(), categorias: this.elegidas()
    };
    if (this.profesional) {
      this.profesionales.actualizar(this.profesional.id, datos);
      this.usuarios.renombrarProfesional(this.profesional.id, datos.nombre);
    } else {
      this.profesionales.agregar({ id: this.profesionales.nuevoId(), ...datos });
    }
    this.cerrar.emit();
  }
}
