import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriasService } from '../../../core/categorias.service';
import { Producto } from '../../../core/models';
import { ProductosService } from '../../../core/productos.service';
import { DrawerComponent } from '../../../shared/drawer/drawer.component';

/** Crear o editar un producto */
@Component({
  standalone: true,
  selector: 'app-producto-drawer',
  imports: [ReactiveFormsModule, DrawerComponent],
  template: `
    <app-drawer [abierto]="abierto" [titulo]="producto ? 'Editar producto' : 'Nuevo producto'" formId="prd-form" (cerrar)="cerrar.emit()">
      <form id="prd-form" ngNativeValidate [formGroup]="form" (ngSubmit)="guardar()">
        <div class="f"><label for="d-nombre">Nombre</label><input id="d-nombre" formControlName="nombre" required maxlength="60"></div>
        <div class="row2">
          <div class="f"><label for="d-marca">Marca</label><input id="d-marca" formControlName="marca" maxlength="40"></div>
          <div class="f">
            <label for="d-cat">Categoría</label>
            <select id="d-cat" formControlName="categoria" required>
              <option value="">Elige</option>
              @for (c of categorias.lista(); track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
        </div>
        <div class="row2">
          <div class="f"><label for="d-precio">Precio (S/)</label><input id="d-precio" type="number" min="0" formControlName="precio" required></div>
          <div class="f"><label for="d-stock">Stock</label><input id="d-stock" type="number" min="0" formControlName="stock" required></div>
        </div>
        <div class="f"><label for="d-min">Avisar cuando queden (mínimo)</label><input id="d-min" type="number" min="0" formControlName="minimo" required></div>
      </form>
    </app-drawer>
  `
})
export class ProductoDrawerComponent implements OnChanges {
  @Input() abierto = false;
  @Input() producto: Producto | null = null;
  @Output() cerrar = new EventEmitter<void>();

  protected readonly categorias = inject(CategoriasService);
  private readonly productos = inject(ProductosService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', Validators.required],
    marca: [''],
    categoria: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    minimo: [2, [Validators.required, Validators.min(0)]]
  });

  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['abierto'] || !this.abierto) return;
    const p = this.producto;
    this.form.reset({
      nombre: p?.nombre ?? '', marca: p?.marca ?? '', categoria: p?.categoria ?? '',
      precio: p?.precio ?? 0, stock: p?.stock ?? 0, minimo: p?.minimo ?? 2
    });
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const datos = {
      nombre: v.nombre.trim(), marca: v.marca.trim(), categoria: v.categoria,
      precio: Number(v.precio), stock: Number(v.stock), minimo: Number(v.minimo)
    };
    if (this.producto) this.productos.actualizar(this.producto.id, datos);
    else this.productos.agregar({ id: this.productos.siguienteId(), ...datos });
    this.cerrar.emit();
  }
}
