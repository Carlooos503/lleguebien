/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { NuevoViajeForm } from './components/NuevoViajeForm.tsx';
import { ViajeActivoCard } from './components/ViajeActivoCard.tsx';
import { ContactosManager } from './components/ContactosManager.tsx';
import { HistorialViajes } from './components/HistorialViajes.tsx';
import { RespaldoSection } from './components/RespaldoSection.tsx';
import type { Contacto, Viaje } from './types.ts';
import {
  cargarContactos,
  guardarContactos,
  cargarViajes,
  guardarViajes,
  exportarRespaldoAJson,
} from './utils/storage.ts';
import { CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

/**
 * Componente Principal de "Llegué Bien" - Versión M2 con Persistencia Local (localStorage).
 *
 * CONCEPTOS DIDÁCTICOS PARA EL ESTUDIANTE DE 3ER AÑO:
 * ===================================================
 * 1. Inicialización de Estado Perezosa (Lazy Initializer):
 *    Al pasar una función a `useState(() => { ... })`, React ejecuta la lectura de localStorage
 *    ÚNICAMENTE en el primer render de la app. Si leyéramos `localStorage.getItem` en el cuerpo
 *    del componente, se ejecutaría innecesariamente en cada re-render, afectando el rendimiento.
 *
 * 2. Manejo de Errores y Protección de Datos:
 *    Si `cargarContactos()` o `cargarViajes()` detecta que el JSON está dañado o manipulado,
 *    activamos `errorAlmacenamiento` y BLOQUEAMOS la sobreescritura automática. Así prevenimos
 *    borrar información del usuario por error.
 *
 * 3. Feedback Honesto al Usuario:
 *    Cumpliendo el requisito "no muestres 'guardado' si falló el almacenamiento", verificamos
 *    el resultado retornado por `guardarContactos()` o `guardarViajes()`. Solo felicitamos si
 *    el navegador realmente persistió la información en el disco del dispositivo.
 */
export default function App() {
  // Pestaña actual de la pantalla móvil ('viaje', 'contactos', 'historial', 'respaldo')
  const [pestanaActiva, setPestanaActiva] = useState<
    'viaje' | 'contactos' | 'historial' | 'respaldo'
  >('viaje');

  // Registro de errores de almacenamiento (ej: datos corruptos o cuota superada)
  const [errorAlmacenamiento, setErrorAlmacenamiento] = useState<string | null>(null);

  // Notificación de éxito o información
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  // Notificación de advertencia/error de operación
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // 1. Cargamos contactos desde localStorage al arrancar
  const [contactos, setContactos] = useState<Contacto[]>(() => {
    const res = cargarContactos();
    if (res.exito && res.datos) {
      return res.datos;
    }
    return [];
  });

  // 2. Cargamos viajes desde localStorage al arrancar
  const [viajes, setViajes] = useState<Viaje[]>(() => {
    const res = cargarViajes();
    if (res.exito && res.datos) {
      return res.datos;
    }
    return [];
  });

  // Al montar, verificamos si alguna de las dos cargas falló por datos dañados
  useEffect(() => {
    const resContactos = cargarContactos();
    const resViajes = cargarViajes();

    if (!resContactos.exito && resContactos.error) {
      setErrorAlmacenamiento(resContactos.error);
    } else if (!resViajes.exito && resViajes.error) {
      setErrorAlmacenamiento(resViajes.error);
    }
  }, []);

  // Estado derivado: viaje actualmente en curso
  const viajeActivo = viajes.find((v) => v.estado === 'en_curso') || null;

  // Manejador: Agregar nuevo contacto
  const handleAgregarContacto = (nuevoContacto: Contacto) => {
    const nuevosContactos = [...contactos, nuevoContacto];
    setContactos(nuevosContactos);

    // Intentamos persistir en localStorage
    const resultado = guardarContactos(nuevosContactos);

    if (resultado.exito) {
      mostrarNotificacionExito(`Contacto "${nuevoContacto.nombre}" guardado en el almacenamiento local.`);
    } else {
      mostrarNotificacionError(
        resultado.error || 'No se pudo guardar el contacto en el almacenamiento local. Solo se mantendrá en esta sesión.'
      );
    }
  };

  // Manejador: Eliminar contacto
  const handleEliminarContacto = (id: string) => {
    if (viajeActivo && viajeActivo.contactoId === id) {
      alert('No podés eliminar este contacto porque tiene un viaje en curso asignado.');
      return;
    }

    const nuevosContactos = contactos.filter((c) => c.id !== id);
    setContactos(nuevosContactos);

    const resultado = guardarContactos(nuevosContactos);
    if (resultado.exito) {
      mostrarNotificacionExito('Contacto eliminado del almacenamiento.');
    } else {
      mostrarNotificacionError(resultado.error || 'Error al actualizar el almacenamiento.');
    }
  };

  // Manejador: Iniciar viaje
  const handleIniciarViaje = (nuevoViaje: Viaje) => {
    if (viajeActivo) {
      alert('Ya tenés un viaje en curso.');
      return;
    }

    const nuevosViajes = [...viajes, nuevoViaje];
    setViajes(nuevosViajes);
    setPestanaActiva('viaje');

    const resultado = guardarViajes(nuevosViajes);
    if (resultado.exito) {
      mostrarNotificacionExito(`¡Viaje hacia ${nuevoViaje.destino} iniciado y guardado!`);
    } else {
      mostrarNotificacionError(
        resultado.error || 'Viaje iniciado en memoria, pero no pudo guardarse en el almacenamiento local.'
      );
    }
  };

  // Manejador: Presionar botón "¡Llegué!"
  const handleLlegue = (viajeId: string) => {
    const ahoraIso = new Date().toISOString();

    const nuevosViajes = viajes.map((v) => {
      if (v.id === viajeId) {
        return {
          ...v,
          estado: 'finalizado' as const,
          fechaHoraLlegadaReal: ahoraIso,
        };
      }
      return v;
    });

    setViajes(nuevosViajes);

    const resultado = guardarViajes(nuevosViajes);
    if (resultado.exito) {
      mostrarNotificacionExito('¡Excelente! Marcaste tu llegada y quedó guardada en el historial.');
    } else {
      mostrarNotificacionError(
        resultado.error || 'Llegada registrada en memoria, pero falló el almacenamiento local.'
      );
    }
  };

  // Manejador: Cancelar viaje en curso (sin marcar llegada)
  const handleCancelarViaje = (viajeId: string) => {
    const nuevosViajes = viajes.filter((v) => v.id !== viajeId);
    setViajes(nuevosViajes);

    const resultado = guardarViajes(nuevosViajes);
    if (resultado.exito) {
      mostrarNotificacionExito('Viaje cancelado.');
    } else {
      mostrarNotificacionError(resultado.error || 'Error al actualizar el almacenamiento.');
    }
  };

  // Manejador: Exportar respaldo rápido desde cualquier lugar
  const handleExportarRespaldo = () => {
    const resultado = exportarRespaldoAJson(contactos, viajes);
    if (resultado.exito) {
      mostrarNotificacionExito(`Respaldo descargado: ${resultado.datos}`);
    } else {
      mostrarNotificacionError(resultado.error || 'No se pudo generar el archivo de respaldo.');
    }
  };

  const mostrarNotificacionExito = (texto: string) => {
    setMensajeExito(texto);
    setMensajeError(null);
    setTimeout(() => {
      setMensajeExito((actual) => (actual === texto ? null : actual));
    }, 4500);
  };

  const mostrarNotificacionError = (texto: string) => {
    setMensajeError(texto);
    setMensajeExito(null);
    setTimeout(() => {
      setMensajeError((actual) => (actual === texto ? null : actual));
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Contenedor tipo móvil centrado para mantener ergonomía y diseño celular */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-slate-50 border-x border-slate-200/80 shadow-md">
        {/* Barra superior y navegación móvil */}
        <Header
          pestanaActiva={pestanaActiva}
          onCambiarPestana={setPestanaActiva}
          cantidadContactos={contactos.length}
          hayViajeActivo={viajeActivo !== null}
        />

        {/* Mensaje flotante de éxito */}
        {mensajeExito && (
          <div className="mx-4 mt-3 p-3 bg-emerald-700 text-white rounded-xl shadow-md text-xs font-semibold flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span className="flex-1">{mensajeExito}</span>
            <button
              type="button"
              onClick={() => setMensajeExito(null)}
              className="text-white/80 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mensaje flotante de error al guardar */}
        {mensajeError && (
          <div className="mx-4 mt-3 p-3 bg-red-700 text-white rounded-xl shadow-md text-xs font-semibold flex items-center gap-2 transition-all">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-200" />
            <span className="flex-1">{mensajeError}</span>
            <button
              type="button"
              onClick={() => setMensajeError(null)}
              className="text-white/80 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Contenido principal según la pestaña activa */}
        <main className="flex-1 p-4 pb-20">
          {pestanaActiva === 'viaje' && (
            <div className="space-y-4">
              {viajeActivo ? (
                // Si hay viaje activo: mostramos la tarjeta con el botón "¡Llegué!"
                <ViajeActivoCard
                  viaje={viajeActivo}
                  onLlegue={handleLlegue}
                  onCancelarViaje={handleCancelarViaje}
                />
              ) : (
                // Si no hay viaje activo: mostramos el formulario para crearlo
                <NuevoViajeForm
                  contactos={contactos}
                  hayViajeActivo={false}
                  onIniciarViaje={handleIniciarViaje}
                  onIrAContactos={() => setPestanaActiva('contactos')}
                />
              )}
            </div>
          )}

          {pestanaActiva === 'contactos' && (
            <ContactosManager
              contactos={contactos}
              onAgregarContacto={handleAgregarContacto}
              onEliminarContacto={handleEliminarContacto}
              onIrAViaje={() => setPestanaActiva('viaje')}
            />
          )}

          {pestanaActiva === 'historial' && (
            <HistorialViajes
              viajes={viajes}
              onIrANuevoViaje={() => setPestanaActiva('viaje')}
              onExportarRespaldo={handleExportarRespaldo}
            />
          )}

          {pestanaActiva === 'respaldo' && (
            <RespaldoSection
              contactos={contactos}
              viajes={viajes}
              errorAlmacenamiento={errorAlmacenamiento}
              onNotificarExito={mostrarNotificacionExito}
              onNotificarError={mostrarNotificacionError}
            />
          )}

          {/* Ficha explicativa para la práctica escolar */}
          <section className="mt-8 pt-6 border-t border-slate-200/90 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Práctica Escolar - Ejercicio 31 (Mejora M2)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Persistencia local habilitada con <code>localStorage</code> (versión 1.0).
              Tus contactos y viajes se conservan al cerrar o recargar la pestaña.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
