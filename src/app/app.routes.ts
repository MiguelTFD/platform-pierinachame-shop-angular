import { Routes } from '@angular/router';
import { authGuard, invitadaGuard } from './core/auth.guards';
import { SiteLayoutComponent } from './layout/site-layout/site-layout.component';
import { ConfirmacionComponent } from './pages/confirmacion/confirmacion.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';

/*
  Antes cada página era un .html distinto (index.html, contacto.html, ...).
  Ahora es una sola app y el Router muestra el componente según la URL:

    /              → HomeComponent          (index.html)
    /contacto      → ContactoComponent      (contacto.html)
    /confirmacion  → ConfirmacionComponent  (confirmacion.html)
    /login         → LoginComponent         (login.html)
    /panel         → PanelComponent         (panel.html)  🔒 necesita sesión
*/
export const routes: Routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'Beauty Studio · Pierina Chame · Satipo' },
      { path: 'contacto', component: ContactoComponent, title: 'Contacto · Beauty Studio · Pierina Chame' },
      { path: 'confirmacion', component: ConfirmacionComponent, title: 'Cita solicitada · Beauty Studio · Pierina Chame' }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [invitadaGuard],
    title: 'Ingresar · Pierina Chame Beauty Studio'
  },
  {
    path: 'panel',
    // carga perezosa (lazy load): el código del panel solo se descarga al entrar
    loadComponent: () => import('./pages/panel/panel.component').then((m) => m.PanelComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
