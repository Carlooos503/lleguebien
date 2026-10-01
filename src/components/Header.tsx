import { ShieldCheck, Users, Navigation, History } from 'lucide-react';

interface HeaderProps {
  pestanaActiva: 'viaje' | 'contactos' | 'historial';
  onCambiarPestana: (pestana: 'viaje' | 'contactos' | 'historial') => void;
  cantidadContactos: number;
  hayViajeActivo: boolean;
}

/**
 * Encabezado de la aplicación y barra de navegación táctil.
 *
 * CONSEJO PARA EL ESTUDIANTE:
 * Mantener la barra superior simple y con alto contraste (azul oscuro slate-900)
 * garantiza buena visibilidad al usar el celular en la calle o con sol.
 */
export function Header({
  pestanaActiva,
  onCambiarPestana,
  cantidadContactos,
  hayViajeActivo,
}: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 pt-4 pb-3">
        {/* Título de la app y estado del sistema */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                Llegué Bien
              </h1>
              <p className="text-[11px] text-slate-300">
                Avisos de llegada para estudiantes
              </p>
            </div>
          </div>

          {/* Indicador sutil de viaje en curso */}
          {hayViajeActivo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>En viaje</span>
            </div>
          )}
        </div>

        {/* Pestañas de navegación tipo Segmented Control */}
        {/* CONSEJO: Usamos botones accesibles con estados activos claros */}
        <nav
          aria-label="Pestañas principales"
          className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/60"
        >
          <button
            type="button"
            onClick={() => onCambiarPestana('viaje')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] ${
              pestanaActiva === 'viaje'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span>Viaje</span>
            {hayViajeActivo && pestanaActiva !== 'viaje' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onCambiarPestana('contactos')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] ${
              pestanaActiva === 'contactos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Contactos</span>
            <span className="text-[10px] opacity-75 font-mono">({cantidadContactos})</span>
          </button>

          <button
            type="button"
            onClick={() => onCambiarPestana('historial')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] ${
              pestanaActiva === 'historial'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>Historial</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
