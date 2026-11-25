import { Component, ElementRef, Input, OnInit, signal, viewChild, viewChildren } from '@angular/core';
import { CategoriaServicio } from '../../../../core/models';
import { RevealDirective } from '../../../../shared/reveal.directive';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';

/**
 * Carrusel 3D de categorías (antes: activarSliderServicios).
 * Cada tarjeta tiene una posición: 0 = al centro, -1/1 = a los lados, ±3 = escondida.
 * Guardamos esas posiciones en un signal y el HTML se actualiza solo.
 */
@Component({
  standalone: true,
  selector: 'app-services-slider',
  imports: [RevealDirective, SectionHeaderComponent],
  templateUrl: './services-slider.component.html'
})
export class ServicesSliderComponent implements OnInit {
  @Input({ required: true }) categorias: CategoriaServicio[] = [];

  protected readonly pos = signal<number[]>([]);
  protected readonly activo = signal(0);
  protected readonly arrastrando = signal(false);

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly tarjetas = viewChildren<ElementRef<HTMLElement>>('tarjeta');

  private cadena?: ReturnType<typeof setTimeout>;
  private inicioX: number | null = null;
  private arrastro = false;

  ngOnInit(): void {
    const n = this.categorias.length;
    this.pos.set(this.categorias.map((_, i) => (i > n / 2 ? i - n : i)));
  }

  protected oculta(i: number): boolean {
    return Math.abs(this.pos()[i]) >= 3;
  }

  /** Mueve todo el carrusel un lugar (dir = 1 adelante, -1 atrás) */
  private paso(dir: number): void {
    const pos = [...this.pos()];
    const entra = dir > 0 ? 3 : -3;
    const aMover: number[] = [];

    // las tarjetas escondidas saltan al lado por donde van a entrar, sin animación
    pos.forEach((p, i) => {
      if (Math.abs(p) >= 3 && p !== entra) {
        pos[i] = entra;
        aMover.push(i);
      }
    });
    if (aMover.length) {
      const els = this.tarjetas();
      aMover.forEach((i) => {
        const el = els[i].nativeElement;
        el.classList.add('no-move');
        el.style.setProperty('--d', String(entra));
        el.style.setProperty('--ad', '3');
      });
      void this.viewport().nativeElement.offsetWidth; // fuerza al navegador a aplicar el salto
      aMover.forEach((i) => els[i].nativeElement.classList.remove('no-move'));
    }

    const n = pos.length;
    this.pos.set(pos.map((p) => p - dir));
    this.activo.update((a) => (a + dir + n) % n);
  }

  /** Va hasta la tarjeta "destino" por el camino más corto, paso a paso */
  protected irA(destino: number): void {
    clearTimeout(this.cadena);
    const n = this.categorias.length;
    const adelante = (destino - this.activo() + n) % n;
    const atras = n - adelante;
    const dir = adelante <= atras ? 1 : -1;
    let pasos = Math.min(adelante, atras);

    const siguiente = () => {
      if (pasos-- <= 0) return;
      this.paso(dir);
      this.cadena = setTimeout(siguiente, 170);
    };
    siguiente();
  }

  protected mover(dir: number): void {
    const n = this.categorias.length;
    this.irA((this.activo() + dir + n) % n);
  }

  /* ---------- teclado ---------- */
  protected teclado(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') { e.preventDefault(); this.mover(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.mover(-1); }
  }

  /* ---------- arrastrar con el dedo o el mouse ---------- */
  protected bajar(e: PointerEvent): void {
    this.inicioX = e.clientX;
    this.arrastro = false;
  }

  protected arrastrar(e: PointerEvent): void {
    if (this.inicioX === null) return;
    if (Math.abs(e.clientX - this.inicioX) > 8) {
      this.arrastro = true;
      this.arrastrando.set(true);
    }
  }

  protected soltar(e: PointerEvent): void {
    if (this.inicioX === null) return;
    const dx = e.clientX - this.inicioX;
    this.inicioX = null;
    this.arrastrando.set(false);
    if (Math.abs(dx) > 45) this.mover(dx < 0 ? 1 : -1);
  }

  protected cancelar(): void {
    this.inicioX = null;
    this.arrastrando.set(false);
  }

  protected salir(e: PointerEvent): void {
    if (e.pointerType === 'mouse') this.soltar(e);
  }

  /* clic en una tarjeta de los costados = traerla al centro */
  protected clicTarjeta(i: number): void {
    if (this.arrastro) { this.arrastro = false; return; }
    const p = this.pos()[i];
    if (p !== 0 && Math.abs(p) < 3) this.irA(i);
  }
}
