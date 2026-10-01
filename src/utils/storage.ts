/**
 * Módulo de Persistencia Local (localStorage) y Copias de Seguridad para "Llegué Bien".
 *
 * CONCEPTOS DIDÁCTICOS PARA EL ESTUDIANTE DE 3ER AÑO:
 * ===================================================
 * 1. ¿Qué es localStorage?
 *    Es una API sincrónica del navegador que permite almacenar pares clave-valor como texto
 *    (strings). Persiste aunque el usuario cierre la pestaña o el navegador.
 *
 * 2. Versionado de Almacenamiento (Schema Versioning):
 *    Al agregar `v1` a las claves, evitamos que versiones futuras de la app choquen con
 *    estructuras viejas incompatibles. Esto es fundamental para migraciones de datos.
 *
 * 3. Programación Defensiva (No asumir que el dato guardado es válido):
 *    Un error común de los estudiantes es hacer `JSON.parse(localStorage.getItem(...))`
 *    directo. Si el usuario editó el localStorage desde las DevTools o si ocurrió un corte
 *    inesperado, `JSON.parse` lanzará un SyntaxError. Y aun si parsea bien, el contenido
 *    podría no tener los campos requeridos (`nombre`, `telefono`, etc.).
 *
 * 4. Protección contra sobreescritura silenciosa:
 *    Si encontramos datos dañados, NO los borramos automáticamente con datos vacíos.
 *    Notificamos al usuario para que no pierda su información por accidente.
 */

import type { Contacto, Viaje, RespaldoDatos, ResultadoPersistencia } from '../types.ts';

// Claves identificables y versionadas
export const VERSION_ALMACENAMIENTO = '1.0';
export const CLAVE_VERSION = 'llegue_bien_version';
export const CLAVE_CONTACTOS = 'llegue_bien_v1_contactos';
export const CLAVE_VIAJES = 'llegue_bien_v1_viajes';

/**
 * Validador de tipo para Contacto (Type Guard en TypeScript).
 * Verifica en tiempo de ejecución que el objeto tenga las propiedades esperadas.
 */
function esContactoValido(item: unknown): item is Contacto {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.nombre === 'string' &&
    typeof c.telefono === 'string'
  );
}

/**
 * Validador de tipo para Viaje.
 * Comprueba que el viaje contenga las fechas, el destino y la copia histórica del contacto.
 */
function esViajeValido(item: unknown): item is Viaje {
  if (typeof item !== 'object' || item === null) return false;
  const v = item as Record<string, unknown>;
  const estadoValido = v.estado === 'en_curso' || v.estado === 'finalizado';
  return (
    typeof v.id === 'string' &&
    typeof v.destino === 'string' &&
    typeof v.contactoId === 'string' &&
    typeof v.contactoNombre === 'string' &&
    typeof v.contactoTelefono === 'string' &&
    typeof v.fechaHoraInicio === 'string' &&
    typeof v.fechaHoraEstimada === 'string' &&
    estadoValido &&
    (v.fechaHoraLlegadaReal === undefined || typeof v.fechaHoraLlegadaReal === 'string')
  );
}

/**
 * Comprueba si el almacenamiento local está disponible en el entorno actual.
 */
export function estaLocalStorageDisponible(): boolean {
  try {
    const testClave = '__prueba_storage__';
    window.localStorage.setItem(testClave, testClave);
    window.localStorage.removeItem(testClave);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recupera los contactos guardados en localStorage.
 * Si detecta datos dañados o malformados, NO los sobrescribe y reporta el error.
 */
export function cargarContactos(): ResultadoPersistencia<Contacto[]> {
  if (!estaLocalStorageDisponible()) {
    return {
      exito: false,
      error: 'El almacenamiento local (localStorage) no está disponible en este navegador.',
    };
  }

  try {
    const textoGuardado = window.localStorage.getItem(CLAVE_CONTACTOS);
    if (!textoGuardado) {
      // Primera vez o sin datos previos
      return { exito: true, datos: [] };
    }

    let datosParseados: unknown;
    try {
      datosParseados = JSON.parse(textoGuardado);
    } catch {
      return {
        exito: false,
        error:
          'Los datos de contactos en el almacenamiento están dañados (formato JSON corrupto). No se sobrescribieron para proteger la información.',
      };
    }

    if (!Array.isArray(datosParseados)) {
      return {
        exito: false,
        error:
          'La estructura de contactos guardada no es un arreglo válido. No se ha sobrescrito.',
      };
    }

    // Validamos cada contacto individualmente
    const contactosValidos: Contacto[] = [];
    for (const item of datosParseados) {
      if (!esContactoValido(item)) {
        return {
          exito: false,
          error:
            'Se detectaron contactos con campos faltantes o tipos incorrectos en el almacenamiento. No se ha sobrescrito.',
        };
      }
      contactosValidos.push(item);
    }

    return { exito: true, datos: contactosValidos };
  } catch (error) {
    return {
      exito: false,
      error: `Error al leer contactos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

/**
 * Guarda los contactos en localStorage.
 */
export function guardarContactos(contactos: Contacto[]): ResultadoPersistencia<void> {
  if (!estaLocalStorageDisponible()) {
    return {
      exito: false,
      error: 'No se puede guardar: el almacenamiento local está bloqueado o deshabilitado.',
    };
  }

  try {
    const jsonTexto = JSON.stringify(contactos);
    window.localStorage.setItem(CLAVE_CONTACTOS, jsonTexto);
    window.localStorage.setItem(CLAVE_VERSION, VERSION_ALMACENAMIENTO);
    return { exito: true };
  } catch (error) {
    let mensaje = 'No se pudieron guardar los contactos.';
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        mensaje = 'Se superó el límite de espacio en el almacenamiento del navegador.';
      } else {
        mensaje = `Error al guardar: ${error.message}`;
      }
    }
    return { exito: false, error: mensaje };
  }
}

/**
 * Recupera los viajes guardados en localStorage (tanto activos como finalizados).
 */
export function cargarViajes(): ResultadoPersistencia<Viaje[]> {
  if (!estaLocalStorageDisponible()) {
    return {
      exito: false,
      error: 'El almacenamiento local (localStorage) no está disponible en este navegador.',
    };
  }

  try {
    const textoGuardado = window.localStorage.getItem(CLAVE_VIAJES);
    if (!textoGuardado) {
      return { exito: true, datos: [] };
    }

    let datosParseados: unknown;
    try {
      datosParseados = JSON.parse(textoGuardado);
    } catch {
      return {
        exito: false,
        error:
          'Los datos de viajes en el almacenamiento están dañados (formato JSON corrupto). No se sobrescribieron para proteger la información.',
      };
    }

    if (!Array.isArray(datosParseados)) {
      return {
        exito: false,
        error:
          'La estructura de viajes guardada no es un arreglo válido. No se ha sobrescrito.',
      };
    }

    const viajesValidos: Viaje[] = [];
    for (const item of datosParseados) {
      if (!esViajeValido(item)) {
        return {
          exito: false,
          error:
            'Se detectaron viajes con campos incompletos o corruptos en el almacenamiento. No se ha sobrescrito.',
        };
      }
      viajesValidos.push(item);
    }

    return { exito: true, datos: viajesValidos };
  } catch (error) {
    return {
      exito: false,
      error: `Error al leer viajes: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

/**
 * Guarda los viajes en localStorage.
 */
export function guardarViajes(viajes: Viaje[]): ResultadoPersistencia<void> {
  if (!estaLocalStorageDisponible()) {
    return {
      exito: false,
      error: 'No se puede guardar: el almacenamiento local está bloqueado o deshabilitado.',
    };
  }

  try {
    const jsonTexto = JSON.stringify(viajes);
    window.localStorage.setItem(CLAVE_VIAJES, jsonTexto);
    window.localStorage.setItem(CLAVE_VERSION, VERSION_ALMACENAMIENTO);
    return { exito: true };
  } catch (error) {
    let mensaje = 'No se pudieron guardar los viajes.';
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        mensaje = 'Se superó el límite de espacio en el almacenamiento del navegador.';
      } else {
        mensaje = `Error al guardar: ${error.message}`;
      }
    }
    return { exito: false, error: mensaje };
  }
}

/**
 * Exporta contactos y viajes a un archivo JSON de respaldo descargable.
 *
 * CONSEJO PARA EL ESTUDIANTE:
 * Para crear una descarga de archivo en el navegador sin backend:
 * 1. Creamos un `Blob` con el contenido en texto y el tipo MIME 'application/json'.
 * 2. Usamos `URL.createObjectURL(blob)` para generar un enlace temporal en memoria del navegador.
 * 3. Creamos programáticamente un elemento `<a>` con el atributo `download` y disparamos `.click()`.
 * 4. Limpiamos la URL con `URL.revokeObjectURL()` para no consumir memoria.
 */
export function exportarRespaldoAJson(
  contactos: Contacto[],
  viajes: Viaje[]
): ResultadoPersistencia<string> {
  try {
    const fechaActual = new Date();
    const respaldo: RespaldoDatos = {
      aplicacion: 'Llegué Bien',
      version: VERSION_ALMACENAMIENTO,
      fechaExportacion: fechaActual.toISOString(),
      contactos,
      viajes,
    };

    const contenidoJson = JSON.stringify(respaldo, null, 2);
    const blob = new Blob([contenidoJson], { type: 'application/json;charset=utf-8' });

    // Generamos un nombre descriptivo con fecha local: ej: respaldo_llegue_bien_2026-10-01.json
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const nombreArchivo = `respaldo_llegue_bien_${anio}-${mes}-${dia}.json`;

    const urlTemporal = URL.createObjectURL(blob);
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = urlTemporal;
    enlaceDescarga.download = nombreArchivo;
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);

    // Liberamos la memoria del objeto URL
    setTimeout(() => {
      URL.revokeObjectURL(urlTemporal);
    }, 1000);

    return { exito: true, datos: nombreArchivo };
  } catch (error) {
    return {
      exito: false,
      error: `No se pudo generar el archivo de respaldo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}
