import { Injectable, inject } from '@angular/core';
import { Cita } from './models';
import { StorageService } from './storage.service';
import { WHATSAPP } from '../data/sitio.data';

/** Guarda la cita del formulario y la lee en la página de confirmación */
@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly CLAVE = 'citaPierinaChame';
  private readonly storage = inject(StorageService);

  guardar(cita: Cita): void {
    this.storage.guardar(this.CLAVE, cita);
  }

  ultima(): Cita | null {
    return this.storage.leer<Cita>(this.CLAVE);
  }

  enlaceWhatsapp(cita: Cita): string {
    const mensaje = `Hola Pierina Chame Studio 🤎, soy *${cita.nombre}*. Quisiera confirmar mi *${cita.modo}* para *${cita.servicio}* el día *${cita.fecha}* a las *${cita.hora}*. Mi número es ${cita.celular}.`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  }
}
