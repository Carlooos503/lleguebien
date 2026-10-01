import { useState, type FormEvent } from 'react';
import { MapPin, Clock, UserCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import type { Contacto, Viaje } from '../types.ts';
import { obtenerHoraEstimadaPorDefecto } from '../utils/dateUtils.ts';

interface NuevoViajeFormProps {
  contactos: Contacto[];
  hayViajeActivo: boolean;
  onIniciarViaje: (viaje: Viaje) => void;
  onIrAContactos: () => void;
}

/**
 * Formulario para configurar e iniciar un nuevo viaje.
 *
 * CONCEPTOS CLAVE PARA EL ESTUDIANTE:
 * 1. Restricción de regla de negocio: "Permitir un solo viaje activo a la vez".
 *    Esta regla se valida tanto en la interfaz (deshabilitando el form o mostrando la tarjeta activa)
 *    como en la función de control para evitar inconsistencias lógicas.
 * 2. Fechas locales vs UTC: Inicializamos la hora estimada con `obtenerHoraEstimadaPorDefecto(45)`,
 *    que calcula la hora local + 45 minutos y la formatea en `YYYY-MM-DDTHH:mm`.
 */
export function NuevoViajeForm({
  contactos,
  hayViajeActivo,
  onIniciarViaje,
  onIrAContactos,
}: NuevoViajeFormProps) {
  // Estado local para los campos del viaje
  const [destino, setDestino] = useState('');
  // Por defecto sugerimos que llegará en 45 minutos
  const [fechaHoraEstimada, setFechaHoraEstimada] = useState(() =>
    obtenerHoraEstimadaPorDefecto(45)
  );
  // Si hay al menos un contacto, seleccionamos el primero por conveniencia
  const [contactoSeleccionadoId, setContactoSeleccionadoId] = useState(
    contactos.length > 0 ? contactos[0].id : ''
  );
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Si los contactos cambian (por ejemplo, el usuario agregó el primero)
  // y todavía no hay seleccionado, auto-seleccionamos el nuevo
  if (!contactoSeleccionadoId && contactos.length > 0) {
    setContactoSeleccionadoId(contactos[0].id);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (hayViajeActivo) {
      setErrorValidacion('Ya tenés un viaje en curso. Debés finalizarlo antes de iniciar otro.');
      return;
    }

    const destinoLimpio = destino.trim();
    if (!destinoLimpio) {
      setErrorValidacion('Por favor ingresá el destino (ej: "Instituto").');
      return;
    }

    if (!fechaHoraEstimada) {
      setErrorValidacion('Por favor indicá la fecha y hora estimada de llegada.');
      return;
    }

    // Buscamos el objeto completo del contacto seleccionado
    const contactoElegido = contactos.find((c) => c.id === contactoSeleccionadoId);
    if (!contactoElegido) {
      setErrorValidacion('Por favor seleccioná un contacto de emergencia válido.');
      return;
    }

    // CONSEJO PARA EL ESTUDIANTE:
    // Creamos la instancia del Viaje con estado 'en_curso'.
    // `fechaHoraInicio` toma la fecha y hora actual exacta del sistema con `toISOString()`.
    const nuevoViaje: Viaje = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      destino: destinoLimpio,
      contactoId: contactoElegido.id,
      contactoNombre: contactoElegido.nombre,
      contactoTelefono: contactoElegido.telefono,
      fechaHoraInicio: new Date().toISOString(),
      fechaHoraEstimada: fechaHoraEstimada, // String del datetime-local
      estado: 'en_curso',
    };

    onIniciarViaje(nuevoViaje);
    setErrorValidacion(null);
  };

  // Atajos rápidos para agilizar la carga en el celular
  const destinosComunes = ['Instituto', 'Casa', 'Facultad', 'Trabajo'];

  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-tight">
            Iniciar un Nuevo Viaje
          </h2>
          <p className="text-xs text-slate-500">
            Avisaremos a tu contacto y te esperaremos a la hora indicada
          </p>
        </div>
      </div>

      {errorValidacion && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorValidacion}</span>
        </div>
      )}

      {/* Alerta si no tiene contactos registrados */}
      {contactos.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertCircle className="w-4 h-4" />
            <span>Se requiere al menos un contacto</span>
          </div>
          <p>
            Antes de iniciar un viaje, necesitás registrar a quién avisar si te demorás.
          </p>
          <button
            type="button"
            onClick={onIrAContactos}
            className="mt-2 py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Registrar Contacto Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo: Destino */}
          <div>
            <label
              htmlFor="viaje-destino"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Destino
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                id="viaje-destino"
                type="text"
                placeholder="Ej: Instituto, Casa, Biblioteca..."
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Sugerencias de acceso rápido (Destinos típicos) */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                Sugerencias:
              </span>
              {destinosComunes.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setDestino(sug)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    destino === sug
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Campo: Fecha y hora estimada de llegada */}
          <div>
            <label
              htmlFor="viaje-hora-estimada"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Fecha y Hora Estimada de Llegada
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </span>
              <input
                id="viaje-hora-estimada"
                type="datetime-local"
                value={fechaHoraEstimada}
                onChange={(e) => {
                  setFechaHoraEstimada(e.target.value);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Calculá el tiempo de colectivo, tren o caminata.
            </p>
          </div>

          {/* Campo: Contacto seleccionado */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="viaje-contacto"
                className="text-xs font-semibold text-slate-700"
              >
                Contacto a Avisar
              </label>
              <button
                type="button"
                onClick={onIrAContactos}
                className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
              >
                + Administrar contactos
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <UserCheck className="w-4 h-4" />
              </span>
              <select
                id="viaje-contacto"
                value={contactoSeleccionadoId}
                onChange={(e) => {
                  setContactoSeleccionadoId(e.target.value);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors cursor-pointer"
              >
                {contactos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.telefono})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón principal de Iniciar Viaje */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer shadow-md shadow-slate-900/10 active:scale-[0.99]"
          >
            <span>Iniciar Viaje</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </section>
  );
}
