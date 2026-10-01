ROL:
Sos un desarrollador senior de aplicaciones web y explicás el código de forma sencilla para un estudiante de tercer año de Desarrollo de Software.

CONTEXTO:
Estoy construyendo una aplicación web llamada “Llegué Bien”, correspondiente al ejercicio 31 de mi práctica escolar. Está dirigida a estudiantes que viajan solos. El problema que resuelve es que avisar que uno llegó se olvida justo cuando más importa.

TAREA:
Generá una primera versión funcional con estas tres funciones:
1. Iniciar un viaje indicando destino, fecha y hora estimada de llegada, y contacto seleccionado.
2. Registrar y listar contactos de emergencia con nombre y teléfono.
3. Mostrar un botón “Llegué” que cierre el viaje activo y registre la fecha y hora real de llegada.

RESTRICCIONES:
Usá React y TypeScript. Todo debe estar en español, sin librerías de pago, sin login y sin base de datos en servidor.
En esta etapa guardá los datos solamente en memoria.
No agregues todavía persistencia ni llamadas a Gemini: se incorporarán en mejoras posteriores.
Permití un solo viaje activo a la vez.
Diseñá una interfaz sencilla para celular, con colores azul oscuro, verde y fondos claros.
No agregues mapas, GPS ni envío automático de mensajes.
Comentá los puntos del código que un estudiante podría confundir.

FORMATO DE SALIDA:
Creá los archivos completos dentro del proyecto y mostrales sus nombres.
Explicá cómo probar la aplicación y enumerá lo que todavía no implementaste y por qué.
No afirmes que una función está probada si no la verificaste.

CRITERIO DE ACEPTACIÓN:
Abro la app, registro un contacto de prueba, inicio un viaje hacia “Instituto” con una hora futura y veo el destino y la hora estimada. Presiono “Llegué” y el viaje aparece como finalizado, sin errores en consola.
