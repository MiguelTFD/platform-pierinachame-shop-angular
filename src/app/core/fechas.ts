
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const HORA_APERTURA = '09:00';
export const HORA_CIERRE = '21:00';
export const DIAS_CERRADO = [0]; 


export const HORARIOS: string[] = Array.from({ length: 24 }, (_, i) => deMinutos(9 * 60 + i * 30));

export function hoyISO(): string {
  return aISO(new Date());
}

export function aISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function deISO(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function sumarDias(iso: string, n: number): string {
  const d = deISO(iso);
  d.setDate(d.getDate() + n);
  return aISO(d);
}

export function diaSemana(iso: string): number {
  return deISO(iso).getDay();
}

export function estaAbierto(iso: string): boolean {
  return !DIAS_CERRADO.includes(diaSemana(iso));
}


export function fechaCorta(iso: string): string {
  const d = deISO(iso);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function fechaLarga(iso: string): string {
  const d = deISO(iso);
  return `${DIAS_LARGOS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function nombreDia(iso: string): string {
  return DIAS[deISO(iso).getDay()];
}

export function nombreMes(iso: string): string {
  return MESES[deISO(iso).getMonth()];
}

export function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function deMinutos(total: number): string {
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

/** '14:30' → '2:30 p. m.' */
export function horaAMPM(hora: string): string {
  if (!hora) return '';
  const [h, m] = hora.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}

export function horaActual(): string {
  const d = new Date();
  return deMinutos(d.getHours() * 60 + d.getMinutes());
}

/** Los próximos n días en que el estudio abre, empezando hoy */
export function proximosDiasAbiertos(n: number): string[] {
  const dias: string[] = [];
  let d = hoyISO();
  while (dias.length < n) {
    if (estaAbierto(d)) dias.push(d);
    d = sumarDias(d, 1);
  }
  return dias;
}


export function inicioSemana(iso: string): string {
  const dia = diaSemana(iso);
  return sumarDias(iso, dia === 0 ? -6 : 1 - dia);
}

export function iniciales(nombre: string): string {
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
}

export function soles(n: number): string {
  return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
