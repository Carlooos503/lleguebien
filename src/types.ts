/**
 * Tipos de datos para la aplicación "Llegué Bien".
 *
 * CONSEJO PARA EL ESTUDIANTE:
 * En TypeScript, definir interfaces para nuestras entidades principales
 * nos da autocompletado y previene errores de tipeo en tiempo de desarrollo.
 */

export interface Contacto {
  id: string;
  nombre: string;
  telefono: string;
}

export interface Viaje {
  id: string;
  destino: string;
  // Guardamos una copia del nombre y teléfono del contacto en el viaje.
  // ¿Por qué? Si en el futuro el usuario edita o borra el contacto,
  // el historial de este viaje en particular mantiene la referencia exacta
  // de a quién se le avisó en ese momento (principio de trazabilidad).
  contactoId: string;
  contactoNombre: string;
  contactoTelefono: string;
  fechaHoraInicio: string; // Formato ISO 8601 (ej: 2026-10-01T08:30:00.000Z)
  fechaHoraEstimada: string; // Formato ISO 8601
  fechaHoraLlegadaReal?: string; // Solo existirá cuando el usuario presione "Llegué"
  estado: 'en_curso' | 'finalizado';
}
