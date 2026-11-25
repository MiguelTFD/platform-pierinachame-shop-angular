import { Injectable, computed } from '@angular/core';
import { Coleccion } from './coleccion';
import { Profesional } from './models';
import { PROFESIONALES_BASE } from '../data/usuarios.data';


@Injectable({ providedIn: 'root' })
export class ProfesionalesService extends Coleccion<Profesional> {
  readonly activas = computed(() => this.lista().filter((p) => p.activo));

  constructor() {
    super();
    this.iniciar('pcProfesionales.v1', PROFESIONALES_BASE);
  }

  /** Profesionales activas que atienden esa categoría ('' = todas) */
  deCategoria(categoria: string): Profesional[] {
    return this.activas().filter((p) => !categoria || p.categorias.includes(categoria));
  }

  nombre(id: string): string {
    return this.porId(id)?.nombre ?? 'Sin asignar';
  }

  nuevoId(): string {
    return this.siguienteCodigo('PRO', 1);
  }

  /**
   * Convierte la foto elegida en una imagen pequeña (máx. 320 px)
   * para que quepa en el navegador sin problemas.
   */
  leerFoto(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onerror = () => reject(lector.error);
      lector.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('No se pudo leer la imagen'));
        img.onload = () => {
          const lado = 320;
          const escala = Math.min(1, lado / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = String(lector.result);
      };
      lector.readAsDataURL(archivo);
    });
  }
}
