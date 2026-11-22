# InstrucciónFácil · Frontend Angular

Proyecto independiente en Angular 21. Consume la API REST de InstrucciónFácil con las rutas `/api/v1`. El frontend y el backend se ejecutan simultáneamente en procesos distintos.

Los tipos de solicitud y respuesta que usa Angular están en `src/app/contrato-api.ts`. El servicio `Api` centraliza las rutas y transforma la carga de comprobantes en los campos multipart `medio`, `operacion` y `archivo`.

## Ejecutar en paralelo en Windows

Requisitos: Docker Desktop para el backend y Node.js **22.12 o superior de la rama 22**, o **24.x**, para Angular.

**Terminal 1 · backend**

Abre PowerShell en la raíz de [InstruccionFacil-Backend](https://github.com/andrewsernaoficial-tech/InstruccionFacil-Backend), donde está `compose.yaml`. Prepara el `.env` según su README y luego ejecuta:

```powershell
docker compose up -d --build
docker compose ps
```

La API queda en [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health). Oracle queda en el puerto 1521.

**Terminal 2 · frontend**

Abre otra ventana de PowerShell dentro de `InstruccionFacilFrontend`:

```powershell
npm ci
npm start
```

Abre [http://localhost:4200](http://localhost:4200). Angular reenvía las solicitudes `/api/v1/*` a `http://127.0.0.1:8080` mediante `proxy.conf.json`. Si cambias el puerto publicado del backend, actualiza el destino en ese archivo y reinicia Angular.

Inicia sesión con el administrador de la aplicación configurado en el backend. En el repositorio público se configura mediante `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD`. La contraseña del usuario de Oracle corresponde a SQL Developer.

## Recorrido de prueba

1. Como administrador, abre **Gestión de la escuela** y crea un tipo de clase, un instructor y un vehículo activo. En **Cobros**, guarda el número de Yape de la escuela y adjunta el QR oficial. Inicia sesión como instructor y agrega disponibilidad en **Mis horarios**.
2. Cierra sesión, pulsa **Regístrate** y crea una cuenta de alumno. Completa el nombre, correo, teléfono, DNI, fecha de nacimiento, dirección y contraseña.
3. Abre **Nueva reserva**, selecciona la clase, el instructor y la fecha, consulta horarios y confirma uno. Para usar un vehículo de la escuela, debe existir una unidad disponible con la transmisión solicitada.
4. En la **Agenda**, abre la cita para contactar al instructor y elegir cómo pagar. Adjunta un JPG, PNG o PDF de hasta 5 MB con un número de operación único si pagaste por un medio digital. Si eliges efectivo puedes pagar en la escuela.
5. Entra como administrador o recepción, abre **Revisión de pagos** y aprueba el comprobante o confirma la recepción del efectivo. La cita pasa a **Confirmada** y el recibo PDF queda disponible en **Agenda** para el alumno y el administrador.
6. **Mi perfil** permite editar los datos que admite la API. Recepción también puede buscar un alumno por correo o teléfono y registrar una reserva a su nombre. El instructor puede consultar su agenda y registrar el inicio, inasistencia o finalización de una clase.

## Compilar para publicar

```powershell
npm run build
```

La salida queda en `dist/instruccionfacil/browser/`. En un servidor de publicación, configura el fallback a `index.html` para las rutas de Angular y el reenvío de `/api/` al backend. El proxy de desarrollo se aplica cuando se usa `npm start`.

Se verificó la integración con el backend real en su perfil local H2. El mismo frontend usa las rutas REST al conectarse al backend con Oracle.
