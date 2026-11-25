import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Cajón lateral reutilizable. Lo de adentro se pasa con <ng-content> (content projection):
 *
 *   <app-drawer [abierto]="x" titulo="Editar" formId="mi-form" (cerrar)="x = false">
 *     <form id="mi-form" ...> ... </form>
 *   </app-drawer>
 *
 * El botón "Guardar" del pie envía el formulario cuyo id se pasa en formId.
 */
@Component({
  standalone: true,
  selector: 'app-drawer',
  template: `
    <div class="drawer-bg" [class.open]="abierto" (click)="cerrar.emit()"></div>
    <aside class="drawer" [class.open]="abierto" [attr.aria-hidden]="!abierto" [attr.inert]="abierto ? null : ''">
      <div class="drawer-head">
        <h2>{{ titulo }}</h2>
        <button class="icon-btn" type="button" aria-label="Cerrar" (click)="cerrar.emit()">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <ng-content />
      <div class="drawer-foot">
        <button type="button" class="btn-sm btn-ghost" (click)="cerrar.emit()">Cancelar</button>
        @if (formId) {
          <button type="submit" [attr.form]="formId" class="btn-sm">{{ textoGuardar }}</button>
        }
      </div>
    </aside>
  `
})
export class DrawerComponent {
  @Input() abierto = false;
  @Input() titulo = '';
  @Input() formId = '';
  @Input() textoGuardar = 'Guardar';
  @Output() cerrar = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  alPresionarEscape(): void {
    if (this.abierto) this.cerrar.emit();
  }
}
