
import {
  CategoriaServicio, Estadistica, GrupoPreguntas, Testimonio, Transformacion
} from '../core/models';

export const WHATSAPP = '51929247255';
export const WHATSAPP_TEXTO = '+51 929 247 255';
export const CORREO = 'pierinachamestudio@gmail.com';
export const DIRECCION = 'Av. Francisco Irazola, Satipo, Junín';
export const HORARIO = 'Lunes a sábado · 09:00 a.m. – 9:00 p.m.';
export const MAPS_URL =
  'https://www.google.com/maps/place/Avenida+Francisco+Irazola,+Satipo+12261/@-11.255,-74.6374,17z/data=!4m6!3m5!1s0x910bc0ff3a050727:0xcbb669b6b28625e3!8m2!3d-11.2534415!4d-74.6348182!16s%2Fg%2F11rxrjr8p8?hl=es&entry=ttu';

export const FOTOS_HERO: { src: string; alt: string }[] = [
  { src: 'img/unas.jpeg', alt: 'Trabajo Pierina Chame 1' },
  { src: 'img/maquillaje-de-novia-glam.jpg', alt: 'Trabajo Pierina Chame 2' },
  { src: 'img/coreano.jpg', alt: 'Trabajo Pierina Chame 3' },
  { src: 'img/download.jpg', alt: 'Trabajo Pierina Chame 4' }
];

export const MARQUEE: string[] = [
  'Manicure', 'Pedicure', 'Microshading de cejas', 'Powder brows',
  'Micropigmentación de labios', 'Neutralización de labios', 'Efecto foxy eyes',
  'Lifting de pestañas', 'Keratina', 'Botox capilar', 'Tratamientos faciales',
  'Maquillaje profesional'
];

export const ESTADISTICAS: Estadistica[] = [
  { valor: 150, texto: '+ clientas satisfechas' },
  { valor: 5, decimales: 1, texto: 'Rating ★' },
  { valor: 6, texto: 'Especialidades' },
  { valor: 6, texto: 'Días a la semana · 9 a 9' }
];

export const CATEGORIAS: CategoriaServicio[] = [
  { nombre: 'Manos y pies', imagen: 'img/manosypies.png',
    servicios: ['Manicure', 'Pedicure', 'Uñas acrílicas'] },
  { nombre: 'Cejas', imagen: 'img/micro.png',
    servicios: ['Microshading de cejas', 'Powder brows', 'Micropigmentación de cejas', 'Laminado de cejas'] },
  { nombre: 'Labios', imagen: 'img/boca.png',
    servicios: ['Micropigmentación de labios', 'Neutralización de labios', 'Delineado permanente'] },
  { nombre: 'Pestañas', imagen: 'img/ojo.png',
    servicios: ['Efecto foxy eyes', 'Lifting de pestañas', 'Lifting coreano'] },
  { nombre: 'Cabello', imagen: 'img/pelo.png',
    servicios: ['Keratina', 'Botox capilar', 'Color + hidratación (tinte, balayage)', 'Peinados'] },
  { nombre: 'Rostro y maquillaje', imagen: 'img/makeup.png',
    servicios: ['Tratamientos faciales', 'Maquillaje profesional', 'Looks para eventos'] }
];

/* Lista plana de servicios para el <select> del formulario */
export const TODOS_LOS_SERVICIOS: string[] = CATEGORIAS.flatMap((c) => c.servicios);

export const PASOS: string[] = [
  'Solicitas tu cita o evaluación.',
  'Recepción confirma fecha y hora.',
  'La especialista evalúa lo que buscas.',
  'Recibes propuesta y precio claros.',
  'Realizamos el servicio y te damos cuidados.'
];

export const TRANSFORMACIONES: Transformacion[] = [
  { titulo: 'Cejas', descripcion: 'Microblading y micropigmentación.',
    antes: 'img/cejas-antes.png', despues: 'img/cejas-despues.png' },
  { titulo: 'Cabello maltratado', descripcion: 'Antes y después de keratina.',
    antes: 'img/keratinas.png', despues: 'img/keratinabefore.png' },
  { titulo: 'Botox capilar', descripcion: 'Hidratación y brillo visibles.',
    antes: 'img/botoxx.png', despues: 'img/botoxdespues.png' },
  { titulo: 'Labios', descripcion: 'Micropigmentación de labios.',
    antes: 'img/labios-antes.png', despues: 'img/labios-despues.png' },
  { titulo: 'Pestañas', descripcion: 'Lifting y efecto foxy eyes.',
    antes: 'img/pestanas-antes.png', despues: 'img/pestanas-despues.png' },
  { titulo: 'Color', descripcion: 'Balayage y color con hidratación.',
    antes: 'img/color-antes.png', despues: 'img/color-despues.png' }
];

export const FILTROS_TESTIMONIOS: { id: string; texto: string }[] = [
  { id: 'todas', texto: 'Todas' },
  { id: 'keratina', texto: 'Keratina' },
  { id: 'botox', texto: 'Botox capilar' },
  { id: 'microblading', texto: 'Microblading' },
  { id: 'labios', texto: 'Labios' },
  { id: 'pestanas', texto: 'Pestañas' }
];

export const TESTIMONIOS: Testimonio[] = [
  { texto: 'Mi cabello pasó de maltratado a sedoso y con un brillo', autora: 'Andrea M.', iniciales: 'AM', categorias: ['keratina'] },
  { texto: 'El botox capilar me dejó el cabello suave y brillante. Me explicaron todo el proceso.', autora: 'Carolina R.', iniciales: 'CR', categorias: ['botox'] },
  { texto: 'Mis cejas quedaron naturales, justo como las quería. Me encantó el resultado.', autora: 'Valeria L.', iniciales: 'VL', categorias: ['microblading'] },
  { texto: 'Mis labios con color y forma perfectos, sin verse exagerados.', autora: 'Karen S.', iniciales: 'KS', categorias: ['labios'] },
  { texto: 'Mi mirada cambió por completo con el lifting. Trato muy atento.', autora: 'Lucía P.', iniciales: 'LP', categorias: ['pestanas'] },
  { texto: 'Buena atención, de verdad evaluaron mi cabello y me propusieron lo ideal.', autora: 'Mariela T.', iniciales: 'MT', categorias: ['keratina', 'botox'] }
];

export const PREGUNTAS: GrupoPreguntas[] = [
  { titulo: 'Visita', preguntas: [
    { pregunta: '¿Dónde queda el salón?', respuesta: 'Av. Francisco Irazola, Satipo, Junín.' },
    { pregunta: '¿Cuál es el horario de atención?', respuesta: 'Atendemos de lunes a sábado, de 9:00 a.m. a 9:00 p.m.' }
  ] },
  { titulo: 'Reservas', preguntas: [
    { pregunta: '¿Cómo reservo una cita?', respuesta: 'Envía tu solicitud desde el formulario o escríbenos por WhatsApp. Fecha y hora son una preferencia: recepción te escribe para confirmar.' },
    { pregunta: '¿Puedo reservar sin saber qué servicio necesito?', respuesta: 'Sí. Elige «Solicitar evaluación» y te asesoramos.' }
  ] },
  { titulo: 'Evaluación', preguntas: [
    { pregunta: '¿Necesito una evaluación antes del servicio?', respuesta: 'Para color, tratamientos y transformaciones, sí: el servicio adecuado y el precio final se definen en una evaluación personalizada.' },
    { pregunta: '¿Cómo funciona la evaluación?', respuesta: 'La especialista revisa lo que buscas y te presenta una propuesta con su precio antes de empezar. Tú decides si la aceptas.' }
  ] }
];
