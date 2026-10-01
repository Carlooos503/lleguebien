/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header.tsx';
import { NuevoViajeForm } from './components/NuevoViajeForm.tsx';
import { ViajeActivoCard } from './components/ViajeActivoCard.tsx';
import { ContactosManager } from './components/ContactosManager.tsx';
import { HistorialViajes } from './components/HistorialViajes.tsx';
import type { Contacto, Viaje } from './types.ts';
import { CheckCircle2, BookOpen } from 'lucide-react';

/**
 * Componente Principal de la Aplicación "Llegué Bien".
 *
 * EXPLICACIÓN DIDÁCTICA PARA EL ESTUDIANTE:
 * ========================================
 * 1. Single Source of Truth (Única fuente de la verdad):
 *    En lugar de guardar `viajeActivo` en un estado separado de `viajes`,
 *    guardamos la lista completa en `viajes` y calculamos el activo con `.find()`.
 *    Esto evita desfasajes donde un estado dice que hay viaje pero el otro no.
 *
 * 2. Inmutabilidad en los métodos de actualización:
 *    - Agregar: `setContactos(prev => [...prev, nuevo])`
 *    - Eliminar: `setContactos(prev => prev.filter(c => c.id !== id))`
 *    - Actualizar viaje a "Llegué": `setViajes(prev => prev.map(...))`
 *
 * 3. Restricción de regla de negocio:
 *    Permitimos solo un viaje activo a la vez comprobando `viajeActivo !== undefined`.
 */
export default function App() {
  // Pestaña actual de la pantalla móvil ('viaje', 'contactos', 'historial')
  const [pestanaActiva, setPestanaActiva] = useState<'viaje' | 'contactos' | 'historial'>('viaje');

  // Contactos de emergencia guardados en memoria
  const [contactos, setContactos] = useState<Contacto[]>([
    // Dejamos un contacto precargado para facilitar la primera prueba rápida del estudiante,
    // o el usuario puede agregar uno nuevo libremente desde la interfaz.
    {
      id: 'contacto-demo-1',
      nombre: 'Mamá',
      telefono: '+54 9 11 4455-6677',
    },
  ]);

  // Lista de viajes en memoria
  const [viajes, setViajes] = useState<Viaje[]>([]);

  // Notificación temporal al completar una acción
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Estado derivado: viaje actualmente en curso
  const viajeActivo = viajes.find((v) => v.estado === 'en_curso') || null;

  // Manejador: Agregar nuevo contacto
  const handleAgregarContacto = (nuevoContacto: Contacto) => {
    setContactos((prev) => [...prev, nuevoContacto]);
    mostrarNotificacion(`Contacto "${nuevoContacto.nombre}" guardado.`);
  };

  // Manejador: Eliminar contacto
  const handleEliminarContacto = (id: string) => {
    // Si el contacto está asignado al viaje activo, prevenimos borrarlo
    if (viajeActivo && viajeActivo.contactoId === id) {
      alert('No podés eliminar este contacto porque tiene un viaje en curso asignado.');
      return;
    }
    setContactos((prev) => prev.filter((c) => c.id !== id));
    mostrarNotificacion('Contacto eliminado de la memoria.');
  };

  // Manejador: Iniciar viaje
  const handleIniciarViaje = (nuevoViaje: Viaje) => {
    if (viajeActivo) {
      alert('Ya tenés un viaje en curso.');
      return;
    }
    setViajes((prev) => [...prev, nuevoViaje]);
    setPestanaActiva('viaje');
    mostrarNotificacion(`¡Viaje hacia ${nuevoViaje.destino} iniciado con éxito!`);
  };

  // Manejador: Presionar botón "¡Llegué!"
  const handleLlegue = (viajeId: string) => {
    const ahoraIso = new Date().toISOString();

    setViajes((prev) =>
      prev.map((v) => {
        if (v.id === viajeId) {
          return {
            ...v,
            estado: 'finalizado',
            fechaHoraLlegadaReal: ahoraIso,
          };
        }
        return v;
      })
    );

    mostrarNotificacion('¡Excelente! Marcaste tu llegada y el viaje quedó finalizado.');
  };

  // Manejador: Cancelar viaje en curso (sin marcar llegada)
  const handleCancelarViaje = (viajeId: string) => {
    setViajes((prev) => prev.filter((v) => v.id !== viajeId));
    mostrarNotificacion('Viaje cancelado.');
  };

  const mostrarNotificacion = (texto: string) => {
    setMensajeExito(texto);
    setTimeout(() => {
      setMensajeExito((actual) => (actual === texto ? null : actual));
    }, 4000);
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

        {/* Mensaje flotante de feedback al usuario */}
        {mensajeExito && (
          <div className="mx-4 mt-3 p-3 bg-emerald-700 text-white rounded-xl shadow-md text-xs font-semibold flex items-center gap-2 animate-fade-in transition-all">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span className="flex-1">{mensajeExito}</span>
            <button
              type="button"
              onClick={() => setMensajeExito(null)}
              className="text-white/80 hover:text-white text-xs px-1"
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
            />
          )}

          {/* Ficha explicativa para la práctica escolar (colapsable/informativa) */}
          <section className="mt-8 pt-6 border-t border-slate-200/90 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Práctica Escolar - Ejercicio 31</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Esta versión almacena los datos en memoria (variables de estado de React).
              Los datos se reiniciarán si recargás el navegador por completo.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
