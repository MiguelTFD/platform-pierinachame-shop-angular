/* Usuarias de prueba y menú de cada rol (igual que tu auth.js) */
import { ConfigRol, Rol, Servicio, Usuario } from '../core/models';

export const USUARIOS_DEMO: Usuario[] = [
  { email: 'admin@pierinachame.com',       clave: 'Admin2026!',       nombre: 'Pierina Chame', rol: 'admin' },
  { email: 'manicurista@pierinachame.com', clave: 'Manicurista2026!', nombre: 'Rosa Medina',   rol: 'manicurista' },
  { email: 'lashista@pierinachame.com',    clave: 'Lashista2026!',    nombre: 'Lucía Paredes', rol: 'lashista' }
];

const MENU_PROFESIONAL: ConfigRol['grupos'] = [
  { titulo: 'Mi trabajo', items: [
    { id: 'dashboard', icono: 'fa-calendar-days', texto: 'Mi agenda' },
    { id: 'mis-clientas', icono: 'fa-user-group', texto: 'Mis clientas' },
    { id: 'mis-servicios', icono: 'fa-scissors', texto: 'Mis servicios' },
    { id: 'comisiones', icono: 'fa-wallet', texto: 'Mis comisiones' }
  ] },
  { titulo: 'Cuenta', items: [
    { id: 'perfil', icono: 'fa-user-check', texto: 'Mi perfil' }
  ] }
];

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
        { id: 'productos', icono: 'fa-bag-shopping', texto: 'Productos' },
        { id: 'usuarios', icono: 'fa-shield-halved', texto: 'Usuarios y roles' }
      ] }
    ]
  },
  manicurista: { etiqueta: 'Manicurista', grupos: MENU_PROFESIONAL },
  lashista: { etiqueta: 'Lashista', grupos: MENU_PROFESIONAL }
};

export const CATEGORIAS_PANEL: string[] = ['Cejas', 'Pestañas', 'Uñas', 'Cabello', 'Maquillaje', 'Labios'];

export const SERVICIOS_BASE: Servicio[] = [
  { id: 'SRV-001', nombre: 'Microblading de cejas', cat: 'Cejas', dur: 120, precio: 350, prof: 'Marisol Díaz', desc: '', activo: true },
  { id: 'SRV-002', nombre: 'Extensiones de pestañas', cat: 'Pestañas', dur: 90, precio: 150, prof: 'Lucía Paredes', desc: '', activo: true },
  { id: 'SRV-003', nombre: 'Manicure en gel', cat: 'Uñas', dur: 60, precio: 60, prof: 'Rosa Medina', desc: '', activo: true },
  { id: 'SRV-004', nombre: 'Keratina', cat: 'Cabello', dur: 150, precio: 220, prof: 'Pierina Chame', desc: '', activo: false }
];
