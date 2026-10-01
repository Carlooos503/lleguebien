import { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { Viaje } from '../types.ts';
import { formatearFechaHora } from '../utils/dateUtils.ts';

interface ViajeActivoCardProps {
  viaje: Viaje;
  onLlegue: (viajeId: string) => void;
  onCancelarViaje: (viajeId: string) => void;
}

/**
 * Componente que muestra el viaje en curso y el botón principal "¡Llegué!".
 *
 * MEJORAS M4:
 * - Protección contra doble clic en "¡Llegué bien!" para evitar ejecuciones concurrentes.
 * - Soporte para destinos de hasta 120 caracteres con wrapping suave (`break-words`).
 */
export function ViajeActivoCard({
  viaje,
  onLlegue,
  onCancelarViaje,
}: ViajeActivoCardProps) {
  const [, setTick] = useState(0);
  const [mostrarConfirmarCancelacion, setMostrarConfirmarCancelacion] = useState(false);
  // Protección contra doble clic
  const [procesandoLlegada, setProcesandoLlegada] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000); // Cada 30 segundos

    return () => clearInterval(intervalo);
  }, []);

  const handleLlegueClick = () => {
    if (procesandoLlegada) return;
    setProcesandoLlegada(true);
    onLlegue(viaje.id);
  };

  // Calculamos si ya se superó la hora estimada de llegada
  const ahora = new Date();
  const estimada = new Date(viaje.fechaHoraEstimada);
  const estaDemorado = ahora.getTime() > estimada.getTime();

  return (
    <div className="space-y-4">
      {/* Tarjeta Principal del Viaje Activo */}
      <section className="bg-white rounded-3xl p-6 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
        {/* Franja superior decorativa de estado activo */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

        {/* Encabezado del viaje */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Viaje en Curso
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-start gap-2 break-words">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="break-words">{viaje.destino}</span>
            </h2>
          </div>

          {/* Estado de horario */}
          {estaDemorado ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Hora superada</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium shrink-0">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>A tiempo</span>
            </div>
          )}
        </div>

        {/* Detalles del viaje */}
        <div className="space-y-3 py-3 border-y border-slate-100 my-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
              <Clock className="w-4 h-4 text-slate-400" />
              Llegada estimada:
            </span>
            <span className="font-semibold text-slate-900 font-mono text-sm text-right">
              {formatearFechaHora(viaje.fechaHoraEstimada)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
              <User className="w-4 h-4 text-slate-400" />
              Contacto asignado:
            </span>
            <div className="text-right min-w-0">
              <span className="font-semibold text-slate-900 block text-xs truncate">
                {viaje.contactoNombre}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {viaje.contactoTelefono}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hora de inicio:</span>
            <span className="font-mono">{formatearFechaHora(viaje.fechaHoraInicio)}</span>
          </div>
        </div>

        {/* Mensaje de tranquilidad */}
        <p className="text-xs text-slate-500 text-center mb-5">
          Cuando llegues a destino, presioná el botón verde para registrar tu hora de llegada.
        </p>

        {/* BOTÓN PRINCIPAL: "¡LLEGUÉ!" con protección contra doble clic */}
        <button
          type="button"
          onClick={handleLlegueClick}
          disabled={procesandoLlegada}
          className={`w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-base font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all min-h-[56px] ${
            procesandoLlegada ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>{procesandoLlegada ? 'Registrando llegada...' : '¡Llegué bien!'}</span>
        </button>

        {/* Acción secundaria para cancelar el viaje */}
        <div className="mt-4 text-center">
          {!mostrarConfirmarCancelacion ? (
            <button
              type="button"
              onClick={() => setMostrarConfirmarCancelacion(true)}
              className="text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer py-1 px-2"
            >
              Cancelar este viaje
            </button>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs">
              <p className="text-red-700 font-medium">
                ¿Querés cancelar el viaje sin registrar llegada?
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onCancelarViaje(viaje.id)}
                  className="py-1.5 px-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer"
                >
                  Sí, cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarCancelacion(false)}
                  className="py-1.5 px-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                >
                  No, mantener
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tarjeta informativa complementaria para el estudiante */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">
            Consejo de seguridad
          </p>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            Si te demorás, podés llamar a <strong>{viaje.contactoNombre}</strong> al{' '}
            <span className="font-mono text-slate-800 font-semibold">{viaje.contactoTelefono}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
