import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Cita, ConfigRol, Sesion } from './models';
import { ProfesionalesService } from './profesionales.service';
import { StorageService } from './storage.service';
import { UsuariosService } from './usuarios.service';
import { ROLES } from '../data/usuarios.data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly CLAVE = 'pcSesion.v2';
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly usuarios = inject(UsuariosService);
  private readonly profesionales = inject(ProfesionalesService);


  readonly sesion = signal<Sesion | null>(this.leerSesion());

  readonly esAdmin = computed(() => this.sesion()?.rol === 'admin');

  /** Ficha de la profesional que inició sesión (foto, nombre actualizado, categorías) */
  readonly profesional = computed(() => {
    const id = this.sesion()?.profesionalId;
    return id ? this.profesionales.porId(id) ?? null : null;
  });

  readonly nombre = computed(() => this.profesional()?.nombre ?? this.sesion()?.nombre ?? '');


  readonly rol = computed<ConfigRol | null>(() => {
    const s = this.sesion();
    if (!s) return null;
    const base = ROLES[s.rol];
    return s.rol === 'profesional' ? { ...base, etiqueta: this.profesional()?.especialidad ?? base.etiqueta } : base;
  });


  puedeVer(c: Cita): boolean {
    const s = this.sesion();
    if (!s) return false;
    if (s.rol === 'admin') return true;
    const mias = this.profesional()?.categorias ?? [];
    return c.profesionalId === s.profesionalId || (!!c.categoria && mias.includes(c.categoria));
  }

 
  login(email: string, clave: string, recordar: boolean): Sesion | null {
    const u = this.usuarios.buscar(email);
    if (!u || u.clave !== clave) return null;

    const sesion: Sesion = { email: u.email, nombre: u.nombre, rol: u.rol, profesionalId: u.profesionalId };

    this.storage.guardar(this.CLAVE, sesion, recordar ? 'local' : 'session');
    this.storage.borrar(this.CLAVE, recordar ? 'session' : 'local');
    this.sesion.set(sesion);
    return sesion;
  }

  
  isLogged(): boolean {
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
