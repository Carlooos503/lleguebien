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
  CLAVE_VIAJES,
  CLAVE_CONTACTOS,
} from './utils/storage.ts';
import { CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

/**
 * Componente Principal de "Llegué Bien" - Versión M4 con Validaciones Estrictas y Defensivas.
 *
 * MEJORAS M4:
 * 1. Regla de Oro: Impedir un segundo viaje activo (verificación local y en almacenamiento).
 * 2. Sincronización entre pestañas (`window.addEventListener('storage')`) para evitar colisiones.
 * 3. Protección contra corrupción de datos locales y errores de escritura.
 * 4. Notificaciones claras de éxito o error que no engañan al usuario.
 */
export default function App() {
  const [pestanaActiva, setPestanaActiva] = useState<
    'viaje' | 'contactos' | 'historial' | 'respaldo'
  >('viaje');

  // Error de almacenamiento global (ej: JSON corrupto)
  const [errorAlmacenamiento, setErrorAlmacenamiento] = useState<string | null>(null);

  // Notificaciones al usuario
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // 1. Carga inicial de Contactos
  const [contactos, setContactos] = useState<Contacto[]>(() => {
    const res = cargarContactos();
    if (res.exito && res.datos) {
      return res.datos;
    }
    return [];
  });

  // 2. Carga inicial de Viajes
  const [viajes, setViajes] = useState<Viaje[]>(() => {
    const res = cargarViajes();
    if (res.exito && res.datos) {
      return res.datos;
    }
    return [];
  });

  // Verificación de integridad al montar la app
  useEffect(() => {
    const resContactos = cargarContactos();
    const resViajes = cargarViajes();

    if (!resContactos.exito && resContactos.error) {
      setErrorAlmacenamiento(resContactos.error);
    } else if (!resViajes.exito && resViajes.error) {
      setErrorAlmacenamiento(resViajes.error);
    }
  }, []);

  // Sincronización en tiempo real entre múltiples pestañas del mismo navegador
  useEffect(() => {
    const sincronizarEntrePestanas = (e: StorageEvent) => {
      if (e.key === CLAVE_VIAJES) {
        const res = cargarViajes();
        if (res.exito && res.datos) {
          setViajes(res.datos);
        }
      } else if (e.key === CLAVE_CONTACTOS) {
        const res = cargarContactos();
        if (res.exito && res.datos) {
          setContactos(res.datos);
        }
      }
    };

    window.addEventListener('storage', sincronizarEntrePestanas);
    return () => window.removeEventListener('storage', sincronizarEntrePestanas);
  }, []);

  // Estado derivado: viaje actualmente en curso
  const viajeActivo = viajes.find((v) => v.estado === 'en_curso') || null;

  // Manejador: Agregar nuevo contacto
  const handleAgregarContacto = (nuevoContacto: Contacto) => {
    const nuevosContactos = [...contactos, nuevoContacto];
    setContactos(nuevosContactos);

    const resultado = guardarContactos(nuevosContactos);
    if (resultado.exito) {
      mostrarNotificacionExito(`Contacto "${nuevoContacto.nombre}" guardado correctamente.`);
    } else {
      mostrarNotificacionError(
        resultado.error || 'No se pudo guardar el contacto en el almacenamiento local.'
      );
    }
  };

  // Manejador: Eliminar contacto
  const handleEliminarContacto = (id: string) => {
    if (viajeActivo && viajeActivo.contactoId === id) {
      mostrarNotificacionError(
        'No podés eliminar este contacto porque tiene un viaje en curso asignado.'
      );
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

  // Manejador: Iniciar viaje con doble verificación de viaje activo
  const handleIniciarViaje = (nuevoViaje: Viaje) => {
    // 1. Verificación en estado de memoria
    if (viajeActivo) {
      mostrarNotificacionError(
        'Ya tenés un viaje en curso. Debés finalizarlo antes de iniciar otro.'
      );
      return;
    }

    // 2. Verificación defensiva contra concurrencia en almacenamiento
    const viajesStorage = cargarViajes();
    if (viajesStorage.exito && viajesStorage.datos) {
      const existeActivoEnDisco = viajesStorage.datos.some((v) => v.estado === 'en_curso');
      if (existeActivoEnDisco) {
        setViajes(viajesStorage.datos);
        mostrarNotificacionError(
          'Ya existe un viaje en curso iniciado en este dispositivo. No se permite un segundo viaje activo.'
        );
        return;
      }
    }

    const nuevosViajes = [...viajes, nuevoViaje];
    setViajes(nuevosViajes);
    setPestanaActiva('viaje');

    const resultado = guardarViajes(nuevosViajes);
    if (resultado.exito) {
      mostrarNotificacionExito(`¡Viaje hacia ${nuevoViaje.destino} iniciado y guardado!`);
    } else {
      mostrarNotificacionError(
        resultado.error || 'Viaje iniciado en memoria, pero falló el almacenamiento local.'
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

  // Manejador: Cancelar viaje en curso
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

  // Manejador: Exportar respaldo rápido
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

        {/* Mensaje flotante de error al guardar o validar */}
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
              <span>Práctica Escolar - Ejercicio 31 (Mejora M4)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Validaciones defensivas activas: campos no vacíos, teléfono solo numérico (mín. 8 dígitos), destino no numérico (máx. 120 caracteres) y fecha futura.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
