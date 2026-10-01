import { useState, type FormEvent } from 'react';
import { UserPlus, Phone, User, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import type { Contacto } from '../types.ts';

interface ContactosManagerProps {
  contactos: Contacto[];
  onAgregarContacto: (nuevo: Contacto) => void;
  onEliminarContacto: (id: string) => void;
  onIrAViaje?: () => void;
}

interface ErroresContacto {
  nombre?: string;
  telefono?: string;
}

/**
 * Componente para registrar y listar contactos de emergencia.
 *
 * MEJORAS M4 (VALIDACIONES Y DEFENSIVA):
 * - Nombre: Obligatorio, no solo espacios, máximo 80 caracteres, no puede ser solo números.
 * - Teléfono: Obligatorio, solo números (se admiten guiones, espacios y + inicial),
 *   prohíbe letras y exige como mínimo 8 dígitos numéricos.
 * - Protección contra doble clic (isSubmitting).
 * - Errores individuales junto a cada campo sin borrar lo que escribió el usuario.
 */
export function ContactosManager({
  contactos,
  onAgregarContacto,
  onEliminarContacto,
  onIrAViaje,
}: ContactosManagerProps) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errores, setErrores] = useState<ErroresContacto>({});
  const [guardando, setGuardando] = useState(false);

  const validarCampos = (): boolean => {
    const nuevosErrores: ErroresContacto = {};

    // 1. Validación de Nombre
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio y no puede contener solo espacios.';
    } else if (/^\d+$/.test(nombreLimpio)) {
      nuevosErrores.nombre = 'El nombre no puede ser solo números. Ingresá un nombre o apodo.';
    } else if (nombre.length > 80) {
      nuevosErrores.nombre = 'El nombre no puede superar los 80 caracteres.';
    }

    // 2. Validación de Teléfono
    const telefonoLimpio = telefono.trim();
    if (!telefonoLimpio) {
      nuevosErrores.telefono = 'El teléfono es obligatorio y no puede contener solo espacios.';
    } else if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(telefono)) {
      nuevosErrores.telefono = 'El teléfono solo debe contener números, no puede tener letras.';
    } else if (!/^\+?[\d\s-]+$/.test(telefonoLimpio)) {
      nuevosErrores.telefono = 'Formato inválido. Ingresá solo números (se permite + al inicio, guiones y espacios).';
    } else {
      // Contamos la cantidad real de dígitos numéricos
      const digitos = telefonoLimpio.replace(/\D/g, '');
      if (digitos.length < 8) {
        nuevosErrores.telefono = `El teléfono debe tener como mínimo 8 números (ingresaste ${digitos.length}).`;
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Protección contra doble clic
    if (guardando) return;

    if (!validarCampos()) {
      return; // Detiene el envío sin borrar los datos tipeados
    }

    setGuardando(true);

    const nuevoContacto: Contacto = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
    };

    onAgregarContacto(nuevoContacto);

    // Reseteamos el formulario una vez guardado exitosamente
    setNombre('');
    setTelefono('');
    setErrores({});
    setGuardando(false);
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

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Campo Nombre */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contacto-nombre"
                className="block text-xs font-semibold text-slate-700"
              >
                Nombre o Apodo <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {nombre.length}/80
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="contacto-nombre"
                type="text"
                maxLength={80}
                placeholder="Ej: Mamá, Papá, Carlos..."
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errores.nombre) {
                    setErrores((prev) => ({ ...prev, nombre: undefined }));
                  }
                }}
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                  errores.nombre
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              />
            </div>
            {/* Mensaje de error junto al campo */}
            {errores.nombre && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errores.nombre}</span>
              </p>
            )}
          </div>

          {/* Campo Teléfono */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contacto-telefono"
                className="block text-xs font-semibold text-slate-700"
              >
                Teléfono <span className="text-red-500">*</span>{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  (solo números, mín. 8 dígitos)
                </span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="contacto-telefono"
                type="tel"
                placeholder="Ej: 1123456789 o +54 9 11 2345-6789"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value);
                  if (errores.telefono) {
                    setErrores((prev) => ({ ...prev, telefono: undefined }));
                  }
                }}
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                  errores.telefono
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              />
            </div>
            {/* Mensaje de error junto al campo */}
            {errores.telefono && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errores.telefono}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={guardando}
            className={`w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-xs active:scale-[0.99] ${
              guardando ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{guardando ? 'Guardando...' : 'Guardar Contacto'}</span>
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
            Almacenado localmente
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
                    <p className="text-sm font-semibold text-slate-900 truncate break-words">
                      {c.nombre}
                    </p>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{c.telefono}</span>
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
