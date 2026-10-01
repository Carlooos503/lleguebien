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

interface ErroresViaje {
  destino?: string;
  fechaHoraEstimada?: string;
  contacto?: string;
  general?: string;
}

/**
 * Formulario para configurar e iniciar un nuevo viaje.
 *
 * MEJORAS M4 (VALIDACIONES Y DEFENSIVA):
 * - Destino: Obligatorio, no solo espacios, máximo 120 caracteres, prohibido solo números.
 * - Fecha y Hora Estimada: Obligatoria, formato válido y estrictamente futura (posterior a ahora).
 * - Contacto: Obligatorio, debe coincidir con un contacto registrado.
 * - Doble clic: Bloqueo del botón y de la función durante el envío para evitar duplicados.
 * - Errores individuales junto a cada campo sin limpiar lo que el usuario ingresó.
 */
export function NuevoViajeForm({
  contactos,
  hayViajeActivo,
  onIniciarViaje,
  onIrAContactos,
}: NuevoViajeFormProps) {
  const [destino, setDestino] = useState('');
  const [fechaHoraEstimada, setFechaHoraEstimada] = useState(() =>
    obtenerHoraEstimadaPorDefecto(45)
  );
  const [contactoSeleccionadoId, setContactoSeleccionadoId] = useState(
    contactos.length > 0 ? contactos[0].id : ''
  );
  const [errores, setErrores] = useState<ErroresViaje>({});
  const [iniciando, setIniciando] = useState(false);

  // Si los contactos se cargan o cambian y no había seleccionado, elegimos el primero
  if (!contactoSeleccionadoId && contactos.length > 0) {
    setContactoSeleccionadoId(contactos[0].id);
  }

  const validarFormulario = (): boolean => {
    const nuevosErrores: ErroresViaje = {};

    if (hayViajeActivo) {
      nuevosErrores.general = 'Ya tenés un viaje en curso. Debés finalizarlo antes de iniciar otro.';
      setErrores(nuevosErrores);
      return false;
    }

    // 1. Validación del Destino
    const destinoLimpio = destino.trim();
    if (!destinoLimpio) {
      nuevosErrores.destino = 'El destino es obligatorio y no puede consistir solo de espacios.';
    } else if (/^\d+$/.test(destinoLimpio)) {
      nuevosErrores.destino = 'El destino no puede ser solo números. Ingresá un lugar (ej: Instituto).';
    } else if (destino.length > 120) {
      nuevosErrores.destino = 'El destino no puede superar los 120 caracteres.';
    }

    // 2. Validación de Fecha y Hora Estimada
    if (!fechaHoraEstimada) {
      nuevosErrores.fechaHoraEstimada = 'La fecha y hora estimada es obligatoria.';
    } else {
      const fechaEstimadaObj = new Date(fechaHoraEstimada);
      if (isNaN(fechaEstimadaObj.getTime())) {
        nuevosErrores.fechaHoraEstimada = 'La fecha y hora ingresada no es válida.';
      } else if (fechaEstimadaObj.getTime() <= Date.now()) {
        nuevosErrores.fechaHoraEstimada =
          'La hora estimada debe ser futura (posterior al momento actual).';
      }
    }

    // 3. Validación del Contacto seleccionado
    if (!contactoSeleccionadoId) {
      nuevosErrores.contacto = 'Debés seleccionar un contacto de emergencia.';
    } else {
      const contactoExiste = contactos.some((c) => c.id === contactoSeleccionadoId);
      if (!contactoExiste) {
        nuevosErrores.contacto = 'El contacto seleccionado no es válido.';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Protección contra doble clic
    if (iniciando) return;

    if (!validarFormulario()) {
      return; // Detenemos el envío sin borrar los datos tipeados
    }

    const contactoElegido = contactos.find((c) => c.id === contactoSeleccionadoId)!;

    setIniciando(true);

    const nuevoViaje: Viaje = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      destino: destino.trim(),
      contactoId: contactoElegido.id,
      contactoNombre: contactoElegido.nombre,
      contactoTelefono: contactoElegido.telefono,
      fechaHoraInicio: new Date().toISOString(),
      fechaHoraEstimada: fechaHoraEstimada,
      estado: 'en_curso',
    };

    onIniciarViaje(nuevoViaje);
    setIniciando(false);
  };

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

      {errores.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errores.general}</span>
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
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Campo: Destino */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="viaje-destino"
                className="block text-xs font-semibold text-slate-700"
              >
                Destino <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {destino.length}/120
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                id="viaje-destino"
                type="text"
                maxLength={120}
                placeholder="Ej: Instituto, Casa, Biblioteca..."
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  if (errores.destino) {
                    setErrores((prev) => ({ ...prev, destino: undefined }));
                  }
                }}
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                  errores.destino
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              />
            </div>

            {/* Error junto al campo destino */}
            {errores.destino && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errores.destino}</span>
              </p>
            )}

            {/* Sugerencias de acceso rápido */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                Sugerencias:
              </span>
              {destinosComunes.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setDestino(sug);
                    if (errores.destino) {
                      setErrores((prev) => ({ ...prev, destino: undefined }));
                    }
                  }}
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
              Fecha y Hora Estimada de Llegada <span className="text-red-500">*</span>
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
                  if (errores.fechaHoraEstimada) {
                    setErrores((prev) => ({ ...prev, fechaHoraEstimada: undefined }));
                  }
                }}
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-colors font-mono ${
                  errores.fechaHoraEstimada
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              />
            </div>

            {/* Error junto al campo fecha/hora */}
            {errores.fechaHoraEstimada ? (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errores.fechaHoraEstimada}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Debe ser posterior a la hora actual. Calculá el tiempo de viaje.
              </p>
            )}
          </div>

          {/* Campo: Contacto seleccionado */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="viaje-contacto"
                className="text-xs font-semibold text-slate-700"
              >
                Contacto a Avisar <span className="text-red-500">*</span>
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
                  if (errores.contacto) {
                    setErrores((prev) => ({ ...prev, contacto: undefined }));
                  }
                }}
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-colors cursor-pointer ${
                  errores.contacto
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              >
                {contactos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.telefono})
                  </option>
                ))}
              </select>
            </div>

            {/* Error junto al campo contacto */}
            {errores.contacto && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errores.contacto}</span>
              </p>
            )}
          </div>

          {/* Botón principal de Iniciar Viaje con protección contra doble clic */}
          <button
            type="submit"
            disabled={iniciando}
            className={`w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px] shadow-md shadow-slate-900/10 active:scale-[0.99] ${
              iniciando ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span>{iniciando ? 'Iniciando viaje...' : 'Iniciar Viaje'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </section>
  );
}
