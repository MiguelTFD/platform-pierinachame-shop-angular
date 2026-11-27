import { Component, Input } from '@angular/core';
import { iniciales } from '../../core/fechas';

/**
 * Foto redonda de una persona. Si todavía no tiene foto, muestra sus iniciales.
 *   <app-avatar [nombre]="p.nombre" [foto]="p.foto" [tamano]="56" />
 */
@Component({
  standalone: true,
  selector: 'app-avatar',
  template: `
    @if (foto) {
      <img [src]="foto" [alt]="'Foto de ' + nombre" [style.width.px]="tamano" [style.height.px]="tamano">
    } @else {
      <span [style.width.px]="tamano" [style.height.px]="tamano" [style.font-size.px]="tamano * 0.36"
            [attr.aria-label]="nombre">{{ letras }}</span>
    }
  `,
  styles: [`
    :host { display: inline-flex; flex: none; }
    img, span { border-radius: 50%; object-fit: cover; display: grid; place-items: center; }
    span {
      background: linear-gradient(135deg, #F6AFAF, #E8D5C4);
      color: #4A3B32; font-family: 'Cormorant Garamond', serif; font-weight: 600; letter-spacing: .02em;
    }
    img { box-shadow: 0 0 0 2px #fff; }
  `]
})
export class AvatarComponent {
  @Input({ required: true }) nombre = '';
  @Input() foto = '';
  @Input() tamano = 44;

  get letras(): string {
    return iniciales(this.nombre);
  }
}
