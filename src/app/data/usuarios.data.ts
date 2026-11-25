
import { ConfigRol, Producto, Profesional, Rol, Servicio, Usuario } from '../core/models';

/** Las mismas categorías que se muestran en la web */
export const CATEGORIAS_BASE: string[] = [
  'Manos y pies', 'Cejas', 'Labios', 'Pestañas', 'Cabello', 'Rostro y maquillaje'
];


export const COMISION = 0.4;

export const PROFESIONALES_BASE: Profesional[] = [
  { id: 'PRO-1', nombre: 'Rosa Medina', especialidad: 'Manicurista',
    categorias: ['Manos y pies'], foto: '', celular: '900000001', activo: true },
  { id: 'PRO-2', nombre: 'Marisol Díaz', especialidad: 'Micropigmentadora',
    categorias: ['Cejas', 'Labios'], foto: '', celular: '900000002', activo: true },
  { id: 'PRO-3', nombre: 'Lucía Paredes', especialidad: 'Lashista y maquilladora',
    categorias: ['Pestañas', 'Rostro y maquillaje'], foto: '', celular: '900000003', activo: true },
  { id: 'PRO-4', nombre: 'Carla Rojas', especialidad: 'Estilista',
    categorias: ['Cabello', 'Rostro y maquillaje'], foto: '', celular: '900000004', activo: true }
];

/* ---------- usuarias para entrar al panel uwu ---------- */
export const USUARIOS_BASE: Usuario[] = [
  { email: 'admin@pierinachame.com', clave: 'Admin2026!', nombre: 'Pierina Chame', rol: 'admin', profesionalId: '' },
  { email: 'manicurista@pierinachame.com', clave: 'Manicurista2026!', nombre: 'Rosa Medina', rol: 'profesional', profesionalId: 'PRO-1' },
  { email: 'cejas@pierinachame.com', clave: 'Cejas2026!', nombre: 'Marisol Díaz', rol: 'profesional', profesionalId: 'PRO-2' },
  { email: 'lashista@pierinachame.com', clave: 'Lashista2026!', nombre: 'Lucía Paredes', rol: 'profesional', profesionalId: 'PRO-3' },
  { email: 'estilista@pierinachame.com', clave: 'Estilista2026!', nombre: 'Carla Rojas', rol: 'profesional', profesionalId: 'PRO-4' }
];

/* ---------- menú de cada rol ---------- */
export const ROLES: Record<Rol, ConfigRol> = {
  admin: {
    etiqueta: 'Administradora',
    grupos: [
      { titulo: 'Principal', items: [
        { id: 'dashboard', icono: 'fa-table-columns', texto: 'Dashboard' },
        { id: 'agenda', icono: 'fa-calendar-days', texto: 'Agenda' },
        { id: 'citas', icono: 'fa-clock', texto: 'Citas' }
      ] },
      { titulo: 'Operación', items: [
        { id: 'caja', icono: 'fa-wallet', texto: 'Caja y pagos' },
        { id: 'inventario', icono: 'fa-box-open', texto: 'Inventario' },
        { id: 'reportes', icono: 'fa-chart-simple', texto: 'Reportes' }
      ] },
      { titulo: 'Mantenimiento', items: [
        { id: 'servicios', icono: 'fa-scissors', texto: 'Servicios' },
        { id: 'categorias', icono: 'fa-tags', texto: 'Categorías' },
        { id: 'profesionales', icono: 'fa-user-check', texto: 'Profesionales' },
        { id: 'clientas', icono: 'fa-user-group', texto: 'Clientas' },
        { id: 'usuarios', icono: 'fa-shield-halved', texto: 'Usuarios y roles' }
      ] }
    ]
  },
  profesional: {
    etiqueta: 'Profesional',
    grupos: [
      { titulo: 'Mi trabajo', items: [
        { id: 'dashboard', icono: 'fa-calendar-days', texto: 'Mi agenda' },
        { id: 'mis-clientas', icono: 'fa-user-group', texto: 'Mis clientas' },
        { id: 'mis-servicios', icono: 'fa-scissors', texto: 'Mis servicios' },
        { id: 'comisiones', icono: 'fa-wallet', texto: 'Mis comisiones' }
      ] },
      { titulo: 'Cuenta', items: [
        { id: 'perfil', icono: 'fa-user-check', texto: 'Mi perfil' }
      ] }
    ]
  }
};


let n = 0;
const srv = (nombre: string, cat: string, dur: number, precio: number): Servicio =>
  ({ id: 'SRV-' + String(++n).padStart(3, '0'), nombre, cat, dur, precio, desc: '', activo: true });

export const SERVICIOS_BASE: Servicio[] = [
  srv('Manicure', 'Manos y pies', 45, 35),
  srv('Pedicure', 'Manos y pies', 60, 45),
  srv('Uñas acrílicas', 'Manos y pies', 120, 90),
  srv('Microshading de cejas', 'Cejas', 150, 350),
  srv('Powder brows', 'Cejas', 150, 380),
  srv('Micropigmentación de cejas', 'Cejas', 150, 350),
  srv('Laminado de cejas', 'Cejas', 45, 70),
  srv('Micropigmentación de labios', 'Labios', 150, 400),
  srv('Neutralización de labios', 'Labios', 150, 420),
  srv('Delineado permanente', 'Labios', 90, 250),
  srv('Efecto foxy eyes', 'Pestañas', 90, 150),
  srv('Lifting de pestañas', 'Pestañas', 60, 90),
  srv('Lifting coreano', 'Pestañas', 75, 110),
  srv('Keratina', 'Cabello', 150, 220),
  srv('Botox capilar', 'Cabello', 120, 180),
  srv('Color + hidratación (tinte, balayage)', 'Cabello', 180, 250),
  srv('Peinados', 'Cabello', 60, 80),
  srv('Tratamientos faciales', 'Rostro y maquillaje', 60, 120),
  srv('Maquillaje profesional', 'Rostro y maquillaje', 75, 150),
  srv('Looks para eventos', 'Rostro y maquillaje', 90, 200)
];

export const PRODUCTOS_BASE: Producto[] = [
  { id: 'PRD-001', nombre: 'Esmalte semipermanente', marca: 'OPI', categoria: 'Manos y pies', precio: 35, stock: 24, minimo: 10 },
  { id: 'PRD-002', nombre: 'Removedor de esmalte', marca: 'Cutex', categoria: 'Manos y pies', precio: 15, stock: 6, minimo: 8 },
  { id: 'PRD-003', nombre: 'Pigmento para cejas', marca: 'PhiBrows', categoria: 'Cejas', precio: 120, stock: 5, minimo: 4 },
  { id: 'PRD-004', nombre: 'Pigmento para labios', marca: 'PhiBrows', categoria: 'Labios', precio: 130, stock: 2, minimo: 3 },
  { id: 'PRD-005', nombre: 'Kit lifting de pestañas', marca: 'Iconsign', categoria: 'Pestañas', precio: 95, stock: 7, minimo: 3 },
  { id: 'PRD-006', nombre: 'Keratina 1 L', marca: 'Inoar', categoria: 'Cabello', precio: 180, stock: 4, minimo: 2 },
  { id: 'PRD-007', nombre: 'Botox capilar 500 g', marca: 'Kativa', categoria: 'Cabello', precio: 140, stock: 1, minimo: 2 },
  { id: 'PRD-008', nombre: 'Base de maquillaje', marca: 'MAC', categoria: 'Rostro y maquillaje', precio: 160, stock: 9, minimo: 3 }
];


export const CLIENTAS_DEMO: { nombre: string; celular: string }[] = [
  { nombre: 'Andrea Molina', celular: '951234870' },
  { nombre: 'Carolina Ríos', celular: '962845113' },
  { nombre: 'Valeria López', celular: '973158642' },
  { nombre: 'Karen Salas', celular: '984267351' },
  { nombre: 'Lucía Pérez', celular: '945318276' },
  { nombre: 'Mariela Torres', celular: '936472915' },
  { nombre: 'Ana Gutiérrez', celular: '927583164' },
  { nombre: 'Fiorella Quispe', celular: '918694253' }
];
