import { Component, inject, signal } from '@angular/core';
import { CategoriasService } from '../../../core/categorias.service';
import { Profesional, Servicio } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { ServiciosService } from '../../../core/servicios.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { ServicioDrawerComponent } from '../servicio-drawer/servicio-drawer.component';

/**
 * Categorías: cada tarjeta muestra quién la atiende y sus servicios con detalle.
 * Desde aquí se pueden agregar servicios a la categoría y marcar qué profesionales la hacen.
 */
@Component({
  standalone: true,
  selector: 'app-categorias-view',
  imports: [AvatarComponent, ServicioDrawerComponent],
  template: `
    <form class="bar" (submit)="agregar($event, nueva)">
      <div class="filtros">
        <input class="campo" #nueva placeholder="Nueva categoría (ej. Depilación)" maxlength="40" aria-label="Nombre de la nueva categoría">
        <button class="btn-sm" type="submit"><i class="fa-solid fa-plus"></i> Agregar categoría</button>
      </div>
      @if (mensaje()) { <p class="form-aviso">{{ mensaje() }}</p> }
    </form>

    <div class="cat-lista">
      @for (c of categorias.lista(); track c) {
        <article class="cat-card" [class.abierta]="abierta() === c">
          <!-- cabecera -->
          <div class="cat-head">
            @if (editando() === c) {
              <form class="filtros" (submit)="guardarNombre($event, c, nombre)">
                <input class="campo" #nombre [value]="c" maxlength="40" aria-label="Nuevo nombre">
                <button class="btn-sm" type="submit">Guardar</button>
                <button class="btn-sm btn-ghost" type="button" (click)="editando.set('')">Cancelar</button>
              </form>
            } @else {
              <button type="button" class="cat-titulo" (click)="alternarAbierta(c)" [attr.aria-expanded]="abierta() === c">
                <h3>{{ c }}</h3>
                <span class="mini">{{ plural(serviciosDe(c).length, 'servicio', 'servicios') }} ·
                  {{ plural(profesDe(c).length, 'profesional', 'profesionales') }}</span>
              </button>
              <div class="cat-avatares">
                @for (p of profesDe(c); track p.id) {
                  <app-avatar [nombre]="p.nombre" [foto]="p.foto" [tamano]="34" [attr.title]="p.nombre" />
                }
              </div>
              <div class="card-acc">
                <button class="icon-btn" type="button" [attr.aria-label]="'Renombrar ' + c" (click)="editando.set(c)"><i class="fa-solid fa-pen"></i></button>
                <button class="icon-btn" type="button" [attr.aria-label]="'Eliminar ' + c" title="Eliminar categoría" (click)="eliminar(c)">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
                <button class="icon-btn" type="button" [attr.aria-label]="(abierta() === c ? 'Cerrar ' : 'Ver detalle de ') + c" (click)="alternarAbierta(c)">
                  <i class="fa-solid" [class.fa-chevron-down]="abierta() !== c" [class.fa-chevron-up]="abierta() === c"></i>
                </button>
              </div>
            }
          </div>

          <!-- borrar: mover servicios o borrarlos -->
          @if (borrando() === c) {
            <div class="cat-borrar">
              <p><b>"{{ c }}" tiene {{ plural(serviciosDe(c).length, 'servicio', 'servicios') }}.</b> ¿Qué hacemos con ellos?</p>
              <div class="filtros">
                <select class="campo" (change)="destino.set($any($event.target).value)" aria-label="Mover a la categoría">
                  <option value="">Elige a qué categoría moverlos</option>
                  @for (otra of categorias.lista(); track otra) {
                    @if (otra !== c) { <option [value]="otra">{{ otra }}</option> }
                  }
                </select>
                <button class="btn-sm" type="button" [disabled]="!destino()" (click)="confirmarBorrado(c, destino())">
                  Mover y eliminar categoría
                </button>
              </div>
              <div class="filtros">
                <button class="btn-sm btn-peligro" type="button" (click)="confirmarBorrado(c, '')">Borrar todo</button>
                <button class="btn-sm btn-ghost" type="button" (click)="borrando.set('')">Cancelar</button>
              </div>
            </div>
          }

          <!-- detalle -->
          @if (abierta() === c) {
            <div class="cat-detalle">
              <h4>¿Quién la atiende?</h4>
              <div class="cat-grid">
                @for (p of profesionales.lista(); track p.id) {
                  <label class="cat-op" [class.on]="p.categorias.includes(c)">
                    <input type="checkbox" [checked]="p.categorias.includes(c)" (change)="alternarProfesional(p, c)">
                    <span class="cat-caja" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                    <span class="cat-txt fila-avatar"><app-avatar [nombre]="p.nombre" [foto]="p.foto" [tamano]="26" />{{ p.nombre }}</span>
                    <span class="cat-si" aria-hidden="true">{{ p.categorias.includes(c) ? 'Sí' : 'No' }}</span>
                  </label>
                }
              </div>

              <div class="cat-sub">
                <h4>Servicios</h4>
                <button class="btn-sm btn-ghost" type="button" (click)="abrirServicio(null, c)"><i class="fa-solid fa-plus"></i> Agregar servicio</button>
              </div>
              @for (s of serviciosDe(c); track s.id) {
                <div class="cat-servicio">
                  <div>
                    <b>{{ s.nombre }}</b>
                    <span class="mini">{{ s.dur }} min · S/ {{ s.precio }}{{ s.desc ? ' · ' + s.desc : '' }}</span>
                  </div>
                  <span class="tag" [class.on]="s.activo" [class.off]="!s.activo">{{ s.activo ? 'Activo' : 'Inactivo' }}</span>
                  <button class="icon-btn" type="button" [attr.aria-label]="'Editar ' + s.nombre" (click)="abrirServicio(s, c)"><i class="fa-solid fa-pen"></i></button>
                </div>
              } @empty {
                <p class="mini">Esta categoría aún no tiene servicios. Agrégalos con el botón de arriba.</p>
              }
            </div>
          }
        </article>
      }
    </div>
    <p class="mini">Toca una categoría para ver sus servicios y marcar quién la atiende. Al renombrarla, se actualiza en todo el panel.</p>

    <app-servicio-drawer
      [abierto]="servicioAbierto()"
      [servicio]="servicio()"
      [codigo]="servicio()?.id ?? servicios.siguienteId()"
      [categoriaInicial]="categoriaServicio()"
      (guardar)="guardarServicio($event)"
      (cerrar)="servicioAbierto.set(false)" />
  `
})
export class CategoriasViewComponent {
  protected readonly categorias = inject(CategoriasService);
  protected readonly servicios = inject(ServiciosService);
  protected readonly profesionales = inject(ProfesionalesService);

  protected readonly editando = signal('');
  protected readonly abierta = signal('');
  protected readonly mensaje = signal('');

  /** Categoría que se está por borrar y a dónde mover sus servicios */
  protected readonly borrando = signal('');
  protected readonly destino = signal('');

  protected readonly servicioAbierto = signal(false);
  protected readonly servicio = signal<Servicio | null>(null);
  protected readonly categoriaServicio = signal('');

  protected serviciosDe(c: string): Servicio[] {
    return this.servicios.lista().filter((s) => s.cat === c);
  }

  protected profesDe(c: string): Profesional[] {
    return this.profesionales.lista().filter((p) => p.categorias.includes(c));
  }

  protected plural(n: number, uno: string, varios: string): string {
    return `${n} ${n === 1 ? uno : varios}`;
  }

  protected alternarAbierta(c: string): void {
    this.abierta.update((a) => (a === c ? '' : c));
  }

  /** Marca / desmarca que esa profesional hace esta categoría */
  protected alternarProfesional(p: Profesional, c: string): void {
    const categorias = p.categorias.includes(c) ? p.categorias.filter((x) => x !== c) : [...p.categorias, c];
    this.profesionales.actualizar(p.id, { categorias });
  }

  protected agregar(e: Event, input: HTMLInputElement): void {
    e.preventDefault();
    const ok = this.categorias.agregar(input.value);
    this.mensaje.set(ok ? '' : 'Escribe un nombre que no exista todavía.');
    if (ok) {
      this.abierta.set(input.value.trim());
      input.value = '';
    }
  }

  protected guardarNombre(e: Event, antes: string, input: HTMLInputElement): void {
    e.preventDefault();
    if (this.categorias.renombrar(antes, input.value)) {
      if (this.abierta() === antes) this.abierta.set(input.value.trim());
      this.editando.set('');
      this.mensaje.set('');
    } else {
      this.mensaje.set('Ese nombre está vacío o ya existe.');
    }
  }

  /** Tacho: si la categoría tiene servicios, pregunta si moverlos o borrarlos */
  protected eliminar(c: string): void {
    if (this.serviciosDe(c).length) {
      this.borrando.set(c);
      this.destino.set('');
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${c}"?`)) this.categorias.eliminar(c);
  }

  /** moverA = '' borra sus servicios; si no, los pasa a esa categoría */
  protected confirmarBorrado(c: string, moverA: string): void {
    if (!moverA && !window.confirm(`Se borrarán "${c}" y sus ${this.serviciosDe(c).length} servicios. ¿Continuar?`)) return;
    this.categorias.eliminar(c, moverA);
    if (moverA) this.abierta.set(moverA);
    else if (this.abierta() === c) this.abierta.set('');
    this.borrando.set('');
  }

  protected abrirServicio(s: Servicio | null, c: string): void {
    this.servicio.set(s);
    this.categoriaServicio.set(c);
    this.servicioAbierto.set(true);
  }

  protected guardarServicio(datos: Omit<Servicio, 'id'>): void {
    const s = this.servicio();
    if (s) this.servicios.actualizar(s.id, datos);
    else this.servicios.agregar({ id: this.servicios.siguienteId(), ...datos });
    this.servicioAbierto.set(false);
  }
}