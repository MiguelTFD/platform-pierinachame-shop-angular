import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Cita, ConfigRol, Sesion } from './models';
import { ProfesionalesService } from './profesionales.service';
import { StorageService } from './storage.service';
import { UsuariosService } from './usuarios.service';
import { ROLES } from '../data/usuarios.data';

/** Inicio y cierre de sesión (antes: js/auth.js) */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly CLAVE = 'pcSesion.v2';
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly usuarios = inject(UsuariosService);
  private readonly profesionales = inject(ProfesionalesService);

  /** Sesión actual como signal: los componentes se actualizan solos */
  readonly sesion = signal<Sesion | null>(this.leerSesion());

  readonly esAdmin = computed(() => this.sesion()?.rol === 'admin');

  /** Ficha de la profesional que inició sesión (foto, nombre actualizado, categorías) */
  readonly profesional = computed(() => {
    const id = this.sesion()?.profesionalId;
    return id ? this.profesionales.porId(id) ?? null : null;
  });

  readonly nombre = computed(() => this.profesional()?.nombre ?? this.sesion()?.nombre ?? '');

  /** Menú y etiqueta según el rol (la profesional ve su especialidad) */
  readonly rol = computed<ConfigRol | null>(() => {
    const s = this.sesion();
    if (!s) return null;
    const base = ROLES[s.rol];
    return s.rol === 'profesional' ? { ...base, etiqueta: this.profesional()?.especialidad ?? base.etiqueta } : base;
  });

  /**
   * ¿Esta cita se le muestra a quien inició sesión?
   * - Administradora: todas.
   * - Trabajadora: solo las de SUS categorías (o las que le asignaron a ella).
   *   Así a la estilista nunca le aparece un pedido de uñas.
   */
  puedeVer(c: Cita): boolean {
    const s = this.sesion();
    if (!s) return false;
    if (s.rol === 'admin') return true;
    const mias = this.profesional()?.categorias ?? [];
    return c.profesionalId === s.profesionalId || (!!c.categoria && mias.includes(c.categoria));
  }

  /** Devuelve la sesión si el correo y la clave son correctos */
  login(email: string, clave: string, recordar: boolean): Sesion | null {
    const u = this.usuarios.buscar(email);
    if (!u || u.clave !== clave) return null;

    const sesion: Sesion = { email: u.email, nombre: u.nombre, rol: u.rol, profesionalId: u.profesionalId };
    // "Recordarme" la guarda en localStorage; si no, solo mientras la pestaña esté abierta
    this.storage.guardar(this.CLAVE, sesion, recordar ? 'local' : 'session');
    this.storage.borrar(this.CLAVE, recordar ? 'session' : 'local');
    this.sesion.set(sesion);
    return sesion;
  }

  estaLogueada(): boolean {
    if (!this.sesion()) this.sesion.set(this.leerSesion());
    return this.sesion() !== null;
  }

  salir(): void {
    this.storage.borrar(this.CLAVE, 'session');
    this.storage.borrar(this.CLAVE, 'local');
    this.sesion.set(null);
    this.router.navigateByUrl('/login');
  }

  private leerSesion(): Sesion | null {
    const s = this.storage.leer<Sesion>(this.CLAVE, 'session') ?? this.storage.leer<Sesion>(this.CLAVE, 'local');
    return s && ROLES[s.rol] ? s : null;
  }
}
