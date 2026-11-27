import { Injectable, inject, signal } from '@angular/core';
import { Usuario } from './models';
import { StorageService } from './storage.service';
import { USUARIOS_BASE } from '../data/usuarios.data';


@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly CLAVE = 'pcUsuarios.v1';
  private readonly storage = inject(StorageService);

  readonly lista = signal<Usuario[]>(this.storage.leer<Usuario[]>(this.CLAVE) ?? USUARIOS_BASE);

  buscar(email: string): Usuario | undefined {
    const correo = email.trim().toLowerCase();
    return this.lista().find((u) => u.email === correo);
  }

  
  guardar(usuario: Usuario, emailAnterior = usuario.email): void {
    const limpio: Usuario = { ...usuario, email: usuario.email.trim().toLowerCase() };
    const existe = this.lista().some((u) => u.email === emailAnterior);
    this.actualizarLista(existe
      ? this.lista().map((u) => (u.email === emailAnterior ? limpio : u))
      : [...this.lista(), limpio]);
  }

  eliminar(email: string): void {
    this.actualizarLista(this.lista().filter((u) => u.email !== email));
  }

  cambiarClave(email: string, clave: string): void {
    this.actualizarLista(this.lista().map((u) => (u.email === email ? { ...u, clave } : u)));
  }

  /** Si Pierina cambia el nombre de una profesional, también cambia en su cuenta */
  renombrarProfesional(profesionalId: string, nombre: string): void {
    this.actualizarLista(this.lista().map((u) => (u.profesionalId === profesionalId ? { ...u, nombre } : u)));
  }

  private actualizarLista(nueva: Usuario[]): void {
    this.lista.set(nueva);
    this.storage.guardar(this.CLAVE, nueva);
  }
}
