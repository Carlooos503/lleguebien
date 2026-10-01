import { History, CheckCircle2, Clock, User, Calendar, Download } from 'lucide-react';
import type { Viaje } from '../types.ts';
import { formatearFechaHora } from '../utils/dateUtils.ts';

interface HistorialViajesProps {
  viajes: Viaje[];
  onIrANuevoViaje?: () => void;
  onExportarRespaldo?: () => void;
}

/**
 * Muestra la lista de viajes finalizados con la hora estimada vs la hora real de llegada.
 *
 * CONCEPTOS CLAVE PARA EL ESTUDIANTE:
 * 1. Array.prototype.filter(): Filtramos solo los viajes que tengan estado 'finalizado'.
 * 2. Inmutabilidad al ordenar: `.slice().reverse()` o crear una copia con `[...viajesFinalizados]`
 *    antes de usar `.sort()`, porque `.sort()` muta el array original en JavaScript.
 * 3. Cálculo de diferencia de minutos: Restamos los milisegundos de dos fechas para saber
 *    si el estudiante llegó antes, a tiempo o con demora.
 */
export function HistorialViajes({
  viajes,
  onIrANuevoViaje,
  onExportarRespaldo,
}: HistorialViajesProps) {
  // Filtramos los viajes completados y los mostramos en orden cronológico inverso (el más reciente primero)
  const viajesFinalizados = viajes
    .filter((v) => v.estado === 'finalizado')
    .slice()
    .reverse();

  /**
   * Calcula la diferencia en minutos entre la llegada real y la estimada.
   */
  const calcularDiferenciaMinutos = (estimadaIso: string, realIso?: string) => {
    if (!realIso) return null;
    const estimada = new Date(estimadaIso).getTime();
    const real = new Date(realIso).getTime();
    const diferenciaMs = real - estimada;
    const minutos = Math.round(diferenciaMs / (1000 * 60));
    return minutos;
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">
                Historial de Viajes
              </h2>
              <p className="text-xs text-slate-500">
                Registro de llegadas confirmadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {viajesFinalizados.length > 0 && onExportarRespaldo && (
              <button
                type="button"
                onClick={onExportarRespaldo}
                title="Exportar respaldo JSON"
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px]">Exportar</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono">
              {viajesFinalizados.length}
            </span>
          </div>
        </div>

        {viajesFinalizados.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            <Calendar className="w-9 h-9 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              Aún no hay viajes finalizados
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Cuando inicies un viaje y presiones el botón "¡Llegué bien!", aparecerá registrado aquí.
            </p>
            {onIrANuevoViaje && (
              <button
                type="button"
                onClick={onIrANuevoViaje}
                className="mt-4 py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
              >
                <span>Iniciar un Viaje</span>
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {viajesFinalizados.map((viaje) => {
              const difMinutos = calcularDiferenciaMinutos(
                viaje.fechaHoraEstimada,
                viaje.fechaHoraLlegadaReal
              );

              return (
                <li
                  key={viaje.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {viaje.destino}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Avisado a: {viaje.contactoNombre}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                      Llegó bien
                    </span>
                  </div>

                  {/* Comparativa: Estimada vs Real */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wide">
                        Llegada Estimada
                      </span>
                      <span className="font-mono text-slate-700 font-medium">
                        {formatearFechaHora(viaje.fechaHoraEstimada)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wide">
                        Llegada Real
                      </span>
                      <span className="font-mono text-emerald-800 font-semibold">
                        {viaje.fechaHoraLlegadaReal
                          ? formatearFechaHora(viaje.fechaHoraLlegadaReal)
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Detalle de puntualidad */}
                  {difMinutos !== null && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {difMinutos <= 0 ? (
                        <span className="text-emerald-700 font-medium">
                          {difMinutos === 0
                            ? 'Llegaste justo a tiempo'
                            : `Llegaste ${Math.abs(difMinutos)} min antes de lo previsto`}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Llegaste {difMinutos} min después de lo previsto
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
