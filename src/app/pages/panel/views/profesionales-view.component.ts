import { Component, inject, signal } from '@angular/core';
import { CitasService } from '../../../core/citas.service';
import { hoyISO } from '../../../core/fechas';
import { Profesional } from '../../../core/models';
import { ProfesionalesService } from '../../../core/profesionales.service';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { ProfesionalDrawerComponent } from '../drawers/profesional-drawer.component';

/** Equipo: Pierina edita nombres y fotos (se ven en la web al reservar) */
@Component({
  standalone: true,
  selector: 'app-profesionales-view',
  imports: [AvatarComponent, ProfesionalDrawerComponent],
  template: `
    <div class="bar">
      <p>{{ profesionales.activas().length }} profesionales activas. Sus fotos y nombres se muestran en la web al reservar.</p>
      <button class="btn-sm" type="button" (click)="abrir(null)"><i class="fa-solid fa-plus"></i> Nueva profesional</button>
    </div>

    <div class="cards">
      @for (p of profesionales.lista(); track p.id) {
        <article class="pro-card" [class.inactiva]="!p.activo">
          <button type="button" class="pro-foto" (click)="abrir(p)" [attr.aria-label]="'Cambiar foto de ' + p.nombre">
            <app-avatar [nombre]="p.nombre" [foto]="p.foto" [tamano]="96" />
            <span class="pro-foto-tip"><i class="fa-solid fa-camera"></i></span>
          </button>
          <h3>{{ p.nombre }}</h3>
          <p class="mini">{{ p.especialidad }}</p>
          <div class="chips">
            @for (c of p.categorias; track c) { <span class="chip">{{ c }}</span> }
          </div>
          <p class="mini">{{ proximas(p.id) }} citas próximas · {{ p.activo ? 'Activa' : 'Inactiva' }}</p>
          <div class="card-acc">
            <button class="btn-sm btn-ghost" type="button" (click)="abrir(p)"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="icon-btn" type="button" [attr.aria-label]="'Eliminar a ' + p.nombre" (click)="eliminar(p)">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </article>
      }
    </div>

    <app-profesional-drawer [abierto]="abierto()" [profesional]="seleccionada()" (cerrar)="abierto.set(false)" />
  `
})
export class ProfesionalesViewComponent {
  protected readonly profesionales = inject(ProfesionalesService);
  private readonly citas = inject(CitasService);

  protected readonly abierto = signal(false);
  protected readonly seleccionada = signal<Profesional | null>(null);

  protected proximas(id: string): number {
    const hoy = hoyISO();
    return this.citas.lista().filter((c) => c.profesionalId === id && c.fecha >= hoy && c.estado !== 'cancelada').length;
  }

  protected abrir(p: Profesional | null): void {
    this.seleccionada.set(p);
    this.abierto.set(true);
  }

  protected eliminar(p: Profesional): void {
    const n = this.proximas(p.id);
    const aviso = n ? `\n\nTiene ${n} citas próximas. Mejor desactívala en "Editar" para no perderlas.` : '';
    if (window.confirm(`¿Eliminar a ${p.nombre}?${aviso}`)) this.profesionales.eliminar(p.id);
  }
}
