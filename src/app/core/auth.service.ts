import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Sesion } from './models';
import { StorageService } from './storage.service';
import { ROLES, USUARIOS_DEMO } from '../data/usuarios.data';

/** Inicio y cierre de sesión (antes: js/auth.js) */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly CLAVE = 'pcSesion';
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  /** Sesión actual como signal: los componentes se actualizan solos */
  readonly sesion = signal<Sesion | null>(this.leerSesion());
  readonly rol = computed(() => {
    const s = this.sesion();
    return s ? ROLES[s.rol] : null;
  });

  /** Devuelve la sesión si el correo y la clave son correctos */
  login(email: string, clave: string, recordar: boolean): Sesion | null {
    const correo = email.trim().toLowerCase();
    const u = USUARIOS_DEMO.find((x) => x.email === correo && x.clave === clave);
    if (!u) return null;

    const sesion: Sesion = { email: u.email, nombre: u.nombre, rol: u.rol };
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
