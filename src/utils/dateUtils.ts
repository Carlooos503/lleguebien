/**
 * Utilidades para el manejo de fechas y horas.
 *
 * CONSEJO PARA EL ESTUDIANTE:
 * Trabajar con fechas suele ser un dolor de cabeza frecuente.
 * El input HTML `<input type="datetime-local" />` espera un string con formato:
 * "YYYY-MM-DDTHH:mm" (hora local, sin zona horaria ni milisegundos).
 * Si usás `date.toISOString()`, te dará la hora UTC (meridiano de Greenwich),
 * lo que puede hacer que la hora en el input se vea corrida varias horas.
 */

/**
 * Convierte un objeto Date al formato local que acepta `<input type="datetime-local" />`.
 */
export function obtenerFormatoInputDateTime(fecha: Date): string {
  const anio = fecha.getFullYear();
  // getMonth() devuelve 0 a 11, por eso sumamos 1.
  // padStart(2, '0') garantiza que 5 se convierta en '05'.
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');

  return `${anio}-${mes}-${dia}T${horas}:${minutos}`;
}

/**
 * Devuelve un formato para el input con una hora sugerida por defecto
 * (por ejemplo, 45 minutos después de la hora actual).
 */
export function obtenerHoraEstimadaPorDefecto(minutosFuturos: number = 45): string {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() + minutosFuturos);
  return obtenerFormatoInputDateTime(ahora);
}

/**
 * Da formato amigable para mostrar en pantalla en español.
 * Ejemplo: "Jueves 1/10 - 18:30 hs"
 */
export function formatearFechaHora(cadenaIsoOInput: string): string {
  if (!cadenaIsoOInput) return '-';
  const fecha = new Date(cadenaIsoOInput);

  if (isNaN(fecha.getTime())) {
    return cadenaIsoOInput;
  }

  // Opciones de formateo localizado en español
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fecha);
}

/**
 * Extrae solo la hora para etiquetas compactas (ej: "18:30").
 */
export function formatearSoloHora(cadenaIsoOInput: string): string {
  if (!cadenaIsoOInput) return '-';
  const fecha = new Date(cadenaIsoOInput);
  if (isNaN(fecha.getTime())) return cadenaIsoOInput;

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fecha);
}
