
export interface CategoriaServicio {
  nombre: string;
  imagen: string;
  servicios: string[];
}

export interface Transformacion {
  titulo: string;
  descripcion: string;
  antes: string;
  despues: string;
}

export interface Testimonio {
  texto: string;
  autora: string;
  iniciales: string;
  categorias: string[];
}

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export interface GrupoPreguntas {
  titulo: string;
  preguntas: Pregunta[];
}

export interface Estadistica {
  valor: number;
  decimales?: number;
  texto: string;
}

/* ---------- equipo ---------- */
export interface Profesional {
  id: string;
  nombre: string;
  especialidad: string;   // ej. "Manicurista"
  categorias: string[];   // categorías que atiende
  foto: string;           // imagen en base64 (la sube Pierina) o '' = sin foto
  celular: string;
  activo: boolean;
}

/* ---------- citas ---------- */
export type EstadoCita = 'pendiente' | 'confirmada' | 'atendida' | 'cancelada';
export type MetodoPago = 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta';

export interface Pago {
  metodo: MetodoPago;
  monto: number;
  fecha: string;          // YYYY-MM-DD
}

export interface Cita {
  id: string;
  modo: string;           // "Cita para un servicio" | "Solicitar evaluación"
  nombre: string;
  celular: string;
  servicio: string;
  categoria: string;
  profesionalId: string;
  fecha: string;          // YYYY-MM-DD
  hora: string;           // HH:MM (24 h)
  duracion: number;       // minutos
  precio: number;         // S/
  estado: EstadoCita;
  pago: Pago | null;
  origen: 'web' | 'panel';
}

/* ---------- panel ---------- */
export type Rol = 'admin' | 'profesional';

export interface Usuario {
  email: string;
  clave: string;
  nombre: string;
  rol: Rol;
  profesionalId: string;  // '' si no está vinculada a una profesional
}

export interface Sesion {
  email: string;
  nombre: string;
  rol: Rol;
  profesionalId: string;
}

export interface ItemMenu {
  id: string;
  icono: string;
  texto: string;
}

export interface GrupoMenu {
  titulo: string;
  items: ItemMenu[];
}

export interface ConfigRol {
  etiqueta: string;
  grupos: GrupoMenu[];
}

export interface Servicio {
  id: string;
  nombre: string;
  cat: string;
  dur: number;
  precio: number;
  desc: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
  minimo: number;
}
