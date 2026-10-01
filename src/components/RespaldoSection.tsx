import { useState } from 'react';
import {
  Download,
  HardDrive,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Database,
  ExternalLink,
} from 'lucide-react';
import type { Contacto, Viaje } from '../types.ts';
import {
  exportarRespaldoAJson,
  VERSION_ALMACENAMIENTO,
  CLAVE_CONTACTOS,
  CLAVE_VIAJES,
  CLAVE_VERSION,
} from '../utils/storage.ts';

interface RespaldoSectionProps {
  contactos: Contacto[];
  viajes: Viaje[];
  errorAlmacenamiento: string | null;
  onNotificarExito: (msg: string) => void;
  onNotificarError: (msg: string) => void;
}

/**
 * Componente para gestionar el almacenamiento local (localStorage)
 * y la exportación de copias de seguridad en formato JSON.
 */
export function RespaldoSection({
  contactos,
  viajes,
  errorAlmacenamiento,
  onNotificarExito,
  onNotificarError,
}: RespaldoSectionProps) {
  const [descargando, setDescargando] = useState(false);
  const [mostrarPreguntas, setMostrarPreguntas] = useState(true);

  const handleExportar = () => {
    setDescargando(true);
    const resultado = exportarRespaldoAJson(contactos, viajes);
    setDescargando(false);

    if (resultado.exito) {
      onNotificarExito(`Respaldo descargado: ${resultado.datos}`);
    } else {
      onNotificarError(resultado.error || 'Error al exportar.');
    }
  };

  const viajesActivos = viajes.filter((v) => v.estado === 'en_curso').length;
  const viajesFinalizados = viajes.filter((v) => v.estado === 'finalizado').length;

  return (
    <div className="space-y-4">
      {/* Alerta si hubo error de almacenamiento */}
      {errorAlmacenamiento && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold text-red-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Alerta de Almacenamiento Local</span>
          </div>
          <p>{errorAlmacenamiento}</p>
          <p className="text-[11px] text-red-600">
            Los datos dañados no fueron sobrescritos para proteger su recuperación.
          </p>
        </div>
      )}

      {/* Tarjeta de Estado del Almacenamiento */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              Almacenamiento Local (localStorage)
            </h2>
            <p className="text-xs text-slate-500">
              Persistencia en tu navegador (Versión {VERSION_ALMACENAMIENTO})
            </p>
          </div>
        </div>

        {/* Resumen de Datos Almacenados */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-lg font-bold text-slate-900 font-mono block">
              {contactos.length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
              Contactos
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-lg font-bold text-emerald-700 font-mono block">
              {viajesActivos}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
              En Viaje
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-lg font-bold text-slate-900 font-mono block">
              {viajesFinalizados}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
              Historial
            </span>
          </div>
        </div>

        {/* Botón Principal de Exportar Respaldo */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleExportar}
            disabled={descargando}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-900/10 min-h-[48px]"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Exportar Respaldo (.json)</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Descarga un archivo con todos tus contactos y el historial completo de viajes.
          </p>
        </div>

        {/* Claves Identificables del Formato */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 block mb-1">
            Claves de almacenamiento utilizadas:
          </span>
          <ul className="space-y-0.5 font-mono text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <li>• {CLAVE_CONTACTOS}</li>
            <li>• {CLAVE_VIAJES}</li>
            <li>• {CLAVE_VERSION} = "{VERSION_ALMACENAMIENTO}"</li>
          </ul>
        </div>
      </section>

      {/* Preguntas Frecuentes y Guía Técnica para el Estudiante */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <button
          type="button"
          onClick={() => setMostrarPreguntas((prev) => !prev)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              ¿Cómo funciona este almacenamiento?
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {mostrarPreguntas ? 'Ocultar' : 'Ver preguntas'}
          </span>
        </button>

        {mostrarPreguntas && (
          <div className="mt-4 space-y-3.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div>
              <p className="font-bold text-slate-800">
                1. ¿Dónde se guarda la información?
              </p>
              <p className="mt-0.5 leading-relaxed text-slate-600">
                Se guarda en el <strong>almacenamiento local del navegador (localStorage)</strong> de tu
                dispositivo. Es una base de datos liviana clave-valor que gestiona Chrome, Safari, Firefox
                o Edge de forma aislada para este dominio web.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">
                2. ¿Qué pasa si cierro la pestaña o reinicio el celular?
              </p>
              <p className="mt-0.5 leading-relaxed text-slate-600">
                <strong>La información se conserva intacta.</strong> A diferencia de la memoria RAM
                (variables normales), `localStorage` persiste permanentemente hasta que el usuario decida
                borrarlo o desinstalar el navegador.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">
                3. ¿Qué pasa si borro los datos del sitio o uso navegación privada?
              </p>
              <p className="mt-0.5 leading-relaxed text-slate-600">
                En <strong>modo incógnito / privado</strong>, el navegador crea un almacenamiento temporal que
                se borra en el instante que cerrás todas las ventanas privadas. Si desde la configuración
                del navegador borrás el "Historial y datos de sitios web", tus contactos y viajes se eliminarán.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">
                4. ¿Qué pasa si cambio de dispositivo (ej. de la PC al celular)?
              </p>
              <p className="mt-0.5 leading-relaxed text-slate-600">
                Al no contar con un servidor central ni cuenta de usuario (login), los datos guardados en tu PC
                <strong> no se sincronizan solos con tu celular</strong>. Por esa razón creamos la función de
                <strong> exportación a JSON</strong>, que te permite descargar tu copia y llevarla contigo.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">
                5. ¿Cómo exportar el respaldo?
              </p>
              <p className="mt-0.5 leading-relaxed text-slate-600">
                Pulsás el botón negro <strong>"Exportar Respaldo (.json)"</strong>. La aplicación crea un objeto
                `Blob` en memoria con la fecha, tus contactos y viajes, y dispara automáticamente la descarga
                de un archivo JSON estándar en tu carpeta de Descargas.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
