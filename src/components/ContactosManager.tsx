import { useState, type FormEvent } from 'react';
import { UserPlus, Phone, User, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import type { Contacto } from '../types.ts';

interface ContactosManagerProps {
  contactos: Contacto[];
  onAgregarContacto: (nuevo: Contacto) => void;
  onEliminarContacto: (id: string) => void;
  onIrAViaje?: () => void;
}

/**
 * Componente para registrar y listar contactos de emergencia.
 *
 * CONCEPTOS CLAVE PARA EL ESTUDIANTE:
 * 1. Formularios Controlados: Cada input tiene su valor ligado al estado local (`value={nombre}`)
 *    y se actualiza con `onChange`. En React evitamos leer el DOM directamente con `document.getElementById`.
 * 2. e.preventDefault(): Evita que el navegador recargue toda la página al enviar el formulario (comportamiento default de HTML).
 * 3. Inmutabilidad: Nunca modificamos el array directamente (ej: `contactos.push()`), sino que
 *    creamos un nuevo array con el nuevo elemento y llamamos a `setContactos`.
 */
export function ContactosManager({
  contactos,
  onAgregarContacto,
  onEliminarContacto,
  onIrAViaje,
}: ContactosManagerProps) {
  // Estados locales para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Limpiamos espacios en blanco al inicio y final
    const nombreLimpio = nombre.trim();
    const telefonoLimpio = telefono.trim();

    // Validación básica en frontend
    if (!nombreLimpio) {
      setErrorValidacion('Por favor ingresá el nombre del contacto.');
      return;
    }

    if (!telefonoLimpio) {
      setErrorValidacion('Por favor ingresá un número de teléfono.');
      return;
    }

    // CONSEJO: Para generar un identificador único en memoria en el frontend,
    // `crypto.randomUUID()` es el estándar moderno en JavaScript (disponible en todos los navegadores).
    // Si no estuviera disponible, una alternativa clásica es `Date.now().toString()`.
    const nuevoContacto: Contacto = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      nombre: nombreLimpio,
      telefono: telefonoLimpio,
    };

    onAgregarContacto(nuevoContacto);

    // Reseteamos el formulario y los errores
    setNombre('');
    setTelefono('');
    setErrorValidacion(null);
  };

  return (
    <div className="space-y-5">
      {/* Tarjeta de Formulario para Nuevo Contacto */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              Nuevo Contacto de Confianza
            </h2>
            <p className="text-xs text-slate-500">
              A quién avisar cuando viajes solo
            </p>
          </div>
        </div>

        {errorValidacion && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorValidacion}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="contacto-nombre"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Nombre o Apodo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="contacto-nombre"
                type="text"
                placeholder="Ej: Mamá, Papá, Carlos..."
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contacto-telefono"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Teléfono (WhatsApp / Llamadas)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="contacto-telefono"
                type="tel"
                placeholder="Ej: +54 9 11 2345-6789"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px] cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Guardar Contacto</span>
          </button>
        </form>
      </section>

      {/* Lista de Contactos Registrados */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Contactos Registrados ({contactos.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            En memoria (esta sesión)
          </span>
        </div>

        {contactos.length === 0 ? (
          <div className="text-center py-7 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            <ShieldAlert className="w-9 h-9 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              No tenés contactos registrados
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Agregá al menos un contacto de confianza para poder asignarlo cuando inicies un viaje.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {contactos.map((c) => (
              <li
                key={c.id}
                className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {c.nombre}
                    </p>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.telefono}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onEliminarContacto(c.id)}
                  title={`Eliminar ${c.nombre}`}
                  aria-label={`Eliminar a ${c.nombre}`}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {contactos.length > 0 && onIrAViaje && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onIrAViaje}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ir a Iniciar Viaje →</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
