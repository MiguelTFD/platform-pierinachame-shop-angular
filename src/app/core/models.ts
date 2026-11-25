/* Tipos (interfaces) que usa toda la app */

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

export interface Cita {
  modo: string;
  nombre: string;
  celular: string;
  servicio: string;
  fecha: string;
  hora: string;
}

/* ---------- panel ---------- */
export type Rol = 'admin' | 'manicurista' | 'lashista';

export interface Usuario {
  email: string;
  clave: string;
  nombre: string;
  rol: Rol;
}

export interface Sesion {
  email: string;
  nombre: string;
  rol: Rol;
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
  prof: string;
  desc: string;
  activo: boolean;
}
