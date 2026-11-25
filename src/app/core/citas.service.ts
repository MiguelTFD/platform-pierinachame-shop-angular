import { Injectable, inject } from '@angular/core';
import { Coleccion } from './coleccion';
import { HORA_CIERRE, deMinutos, deISO, estaAbierto, fechaLarga, horaAMPM, hoyISO, minutos, sumarDias } from './fechas';
import { Cita, EstadoCita, MetodoPago, Profesional, Servicio } from './models';
import { ServiciosService } from './servicios.service';
import { CLIENTAS_DEMO, PROFESIONALES_BASE, SERVICIOS_BASE } from '../data/usuarios.data';
import { WHATSAPP } from '../data/sitio.data';

@Injectable({ providedIn: 'root' })
export class CitasService extends Coleccion<Cita> {
  private readonly CLAVE_ULTIMA = 'pcUltimaCita';
  private readonly servicios = inject(ServiciosService);

  constructor() {
    super();
    this.iniciar('pcCitas.v1', generarCitasDemo());
  }

  nuevoId(): string {
    return this.siguienteCodigo('CIT', 4);
  }


  /** ¿La profesional está libre de "hora" a "hora + duración" ese día? */
  estaLibre(profesionalId: string, fecha: string, hora: string, duracion: number, ignorarId = ''): boolean {
    const ini = minutos(hora);
    const fin = ini + duracion;
    if (fin > minutos(HORA_CIERRE)) return false;
    return !this.lista().some((c) =>
      c.id !== ignorarId && c.profesionalId === profesionalId && c.fecha === fecha && c.estado !== 'cancelada' &&
      ini < minutos(c.hora) + c.duracion && minutos(c.hora) < fin
    );
  }

  /** ¿Hay alguna profesional libre a esa hora? */
  hayLibre(candidatas: Profesional[], fecha: string, hora: string, duracion: number): boolean {
    return candidatas.some((p) => this.estaLibre(p.id, fecha, hora, duracion));
  }

 
  asignarJusta(candidatas: Profesional[], fecha: string, hora: string, duracion: number): Profesional | undefined {
    const libres = candidatas.filter((p) => this.estaLibre(p.id, fecha, hora, duracion));
    const activas = this.lista().filter((c) => c.estado !== 'cancelada');
    const semana = (id: string) => activas.filter((c) => c.profesionalId === id && c.fecha >= fecha && c.fecha <= sumarDias(fecha, 6)).length;
    const delDia = (id: string) => activas.filter((c) => c.profesionalId === id && c.fecha === fecha).length;
    return [...libres].sort((a, b) => delDia(a.id) - delDia(b.id) || semana(a.id) - semana(b.id))[0];
  }


  private oyentes: ((nuevas: Cita[]) => void)[] = [];

 
  alLlegarCitas(fn: (nuevas: Cita[]) => void): () => void {
    this.oyentes.push(fn);
    return () => (this.oyentes = this.oyentes.filter((o) => o !== fn));
  }

  protected override alSincronizar(anterior: Cita[], nueva: Cita[]): void {
    const ids = new Set(anterior.map((c) => c.id));
    const nuevas = nueva.filter((c) => !ids.has(c.id));
    if (nuevas.length) this.oyentes.forEach((fn) => fn(nuevas));
  }

  /* ---------- acciones ---------- */

  crear(datos: Omit<Cita, 'id'>): Cita {
    const cita: Cita = { id: this.nuevoId(), ...datos };
    this.agregar(cita);
    return cita;
  }

  /** La web guarda aquí la cita recién pedida para mostrarla en la confirmación */
  recordarUltima(id: string): void {
    this.storage.guardar(this.CLAVE_ULTIMA, id);
  }

  ultima(): Cita | undefined {
    const id = this.storage.leer<string>(this.CLAVE_ULTIMA);
    return id ? this.porId(id) : undefined;
  }

  cambiarEstado(id: string, estado: EstadoCita): void {
    this.actualizar(id, { estado });
  }

  cobrar(id: string, metodo: MetodoPago): void {
    const c = this.porId(id);
    if (c) this.actualizar(id, { estado: 'atendida', pago: { metodo, monto: c.precio, fecha: hoyISO() } });
  }



  enlaceWhatsapp(c: Cita): string {
    const mensaje = `Hola Pierina Chame Studio 🤎, soy *${c.nombre}*. Quisiera confirmar mi *${c.modo}* para *${c.servicio}*` +
      ` el *${fechaLarga(c.fecha)}* a las *${horaAMPM(c.hora)}*. Mi número es ${c.celular}.`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  }


  enlaceClienta(c: Cita): string {
    const mensaje = `Hola ${c.nombre.split(' ')[0]} 🤍, te escribimos de Pierina Chame Studio para confirmar tu cita de *${c.servicio}* el *${fechaLarga(c.fecha)}* a las *${horaAMPM(c.hora)}*.`;
    return `https://wa.me/51${c.celular}?text=${encodeURIComponent(mensaje)}`;
  }

  servicioDe(c: Cita): Servicio | undefined {
    return this.servicios.porNombre(c.servicio);
  }
}


function generarCitasDemo(): Cita[] {
  const hoy = hoyISO();
  let semilla = deISO(hoy).getTime() / 86400000;
  const azar = () => {
    semilla = (semilla * 9301 + 49297) % 233280;
    return semilla / 233280;
  };
  const elegir = <T>(lista: T[]): T => lista[Math.floor(azar() * lista.length)];
  const metodos: MetodoPago[] = ['Efectivo', 'Yape', 'Plin', 'Tarjeta'];

  const citas: Cita[] = [];
  let numero = 0;

  for (let d = -20; d <= 6; d++) {
    const fecha = sumarDias(hoy, d);
    if (!estaAbierto(fecha)) continue;

    for (const prof of PROFESIONALES_BASE) {
      const opciones = SERVICIOS_BASE.filter((s) => prof.categorias.includes(s.cat));
      const cuantas = d < 0 ? 1 + Math.floor(azar() * 3) : Math.floor(azar() * 3);
      const ocupado: [number, number][] = [];

      for (let i = 0; i < cuantas; i++) {
        const s = elegir(opciones);
        const ini = 9 * 60 + Math.floor(azar() * 20) * 30;
        const fin = ini + s.dur;
        if (fin > 21 * 60 || ocupado.some(([a, b]) => ini < b && a < fin)) continue;
        ocupado.push([ini, fin]);

        const clienta = elegir(CLIENTAS_DEMO);
        const pasada = d < 0;
        const estado: EstadoCita = pasada ? (azar() < 0.88 ? 'atendida' : 'cancelada') : (azar() < 0.7 ? 'confirmada' : 'pendiente');

        citas.push({
          id: 'CIT-' + String(++numero).padStart(4, '0'),
          modo: 'Cita para un servicio',
          nombre: clienta.nombre,
          celular: clienta.celular,
          servicio: s.nombre,
          categoria: s.cat,
          profesionalId: prof.id,
          fecha,
          hora: deMinutos(ini),
          duracion: s.dur,
          precio: s.precio,
          estado,
          pago: estado === 'atendida' ? { metodo: elegir(metodos), monto: s.precio, fecha } : null,
          origen: azar() < 0.6 ? 'web' : 'panel'
        });
      }
    }
  }
  return citas.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
}

