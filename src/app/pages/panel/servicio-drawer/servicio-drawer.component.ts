import {
  Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject, viewChild
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Servicio } from '../../../core/models';
import { CategoriasService } from '../../../core/categorias.service';

/**
 * Cajón lateral para crear o editar un servicio.
 * @Input  → recibe si está abierto, el servicio a editar y el código.
 * @Output → avisa al padre cuando se guarda o se cierra.
 */
@Component({
  standalone: true,
  selector: 'app-servicio-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './servicio-drawer.component.html'
})
export class ServicioDrawerComponent implements OnChanges {
  @Input() abierto = false;
  @Input() servicio: Servicio | null = null;
  @Input() codigo = '';
  /** Categoría que se pone sola al crear (cuando se abre desde Categorías) */
  @Input() categoriaInicial = '';

  @Output() guardar = new EventEmitter<Omit<Servicio, 'id'>>();
  @Output() cerrar = new EventEmitter<void>();

  protected readonly categorias = inject(CategoriasService);
  private readonly inputNombre = viewChild.required<ElementRef<HTMLInputElement>>('inputNombre');
  private ultimoFoco: HTMLElement | null = null;

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    cat: ['', Validators.required],
    dur: [60, [Validators.required, Validators.min(5)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    desc: [''],
    activo: [true]
  });

  /** Ciclo de vida: se ejecuta cada vez que cambia un @Input */
  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['abierto']) return;

    if (this.abierto) {
      const s = this.servicio;
      this.form.reset({
        nombre: s?.nombre ?? '', cat: s?.cat ?? this.categoriaInicial, dur: s?.dur ?? 60, precio: s?.precio ?? 0,
        desc: s?.desc ?? '', activo: s?.activo ?? true
      });
      this.ultimoFoco = document.activeElement as HTMLElement | null;
      setTimeout(() => this.inputNombre().nativeElement.focus(), 120);
    } else if (this.ultimoFoco && document.contains(this.ultimoFoco)) {
      this.ultimoFoco.focus();
    }
  }

  @HostListener('window:keydown.escape')
  alPresionarEscape(): void {
    if (this.abierto) this.cerrar.emit();
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardar.emit({
      nombre: v.nombre.trim(), cat: v.cat, dur: Number(v.dur), precio: Number(v.precio),
      desc: v.desc.trim(), activo: v.activo
    });
  }
}
