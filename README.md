# Llegué Bien

> Aplicación para estudiantes que viajan solos y necesitan recordar avisar que llegaron a su destino.


## 1. Probala ahora

- **Repositorio:** (https://github.com/Carlooos503/lleguebien.git)
- **Usuario de prueba:** No requiere cuenta ni inicio de sesión.

### Uso básico

1. Registra un contacto de emergencia.
2. Escribe el destino y selecciona la fecha y hora estimada de llegada.
3. Selecciona el contacto e inicia el viaje.
4. Al llegar, presiona **“Llegué”** para finalizarlo.
5. Genera el mensaje de llegada y utiliza las opciones disponibles para compartirlo.
6. Si pasa la hora estimada sin confirmar llegada, revisa el estado del viaje y genera el mensaje de alerta.

La aplicación redacta mensajes. El envío al contacto requiere la intervención del usuario.

## 3. Qué hace

La aplicación tiene tres funciones principales:

- **Iniciar un viaje:** permite registrar el destino, la fecha y hora estimada de llegada y el contacto asociado.
- **Guardar contactos de emergencia:** permite registrar contactos para utilizarlos en los viajes.
- **Confirmar la llegada:** el botón “Llegué” finaliza el viaje y registra la fecha y hora real de llegada.

### Persistencia

### Función inteligente

La función redacta un mensaje de llegada o de alerta por retraso utilizando los datos registrados del viaje. La aplicación determina el estado del viaje; la función de redacción no debe inventar ubicaciones, horarios ni causas del retraso.

## 4. Cómo correrlo en tu máquina

### Requisitos

- Git.
- Navegador actualizado.

### Configurar la API, si corresponde

1. Copiar `.env.ejemplo` y nombrar la copia `.env`.
2. Configurar la variable de entorno requerida por el servidor.
3. Mantener `.env` fuera del repositorio.

Ejemplo sin una clave real:

```env
GEMINI_API_KEY=TU_CLAVE_PERSONAL
```

La clave debe utilizarse únicamente desde el servidor y no debe incluirse en el código del navegador.
