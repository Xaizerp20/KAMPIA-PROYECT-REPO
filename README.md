# Proyecto de Dispositivo de Seguridad para Motocicletas

## Descripción

Este proyecto es un sistema de seguridad diseñado para motocicletas que incluye un dispositivo de hardware instalado en la motocicleta y un sistema remoto web desarrollado en Node.js con Express.js. El dispositivo de seguridad está diseñado para brindar protección y seguimiento en caso de robo o situaciones de emergencia.

Tanto el dispositivo de seguridad en la motocicleta como el sistema remoto web utilizan el protocolo MQTT para la comunicación en tiempo real. Esto permite un intercambio eficiente de datos, incluyendo información de GPS y estados del motor, entre el dispositivo y el sistema web.

## Características Principales de la Plataforma
![Gestión de Usuarios](/kampia-node-project/app_Imgs/CONTROLS%20AND%20MAP.jpg)

### Seguimiento GPS

El dispositivo está equipado con un módulo GPS que permite rastrear la ubicación en tiempo real de la motocicleta. Los usuarios pueden ver la ubicación de su motocicleta en un mapa a través del sistema remoto web.

### Bloqueo y Desbloqueo de Ruedas

A través de un control remoto, los propietarios de la motocicleta pueden bloquear o desbloquear el movimiento de las ruedas de la motocicleta. Esto es útil para evitar el robo de la motocicleta cuando está estacionada.

### Detección de Impacto

El dispositivo está equipado con un sensor de impacto que puede detectar golpes o movimientos bruscos. En caso de una colisión o un intento de robo, el sistema puede enviar una notificación de alerta a los propietarios.

### Sistema Remoto Web

El sistema remoto web desarrollado en Node.js con Express.js permite a los propietarios de la motocicleta controlar el dispositivo de manera remota. Las funciones incluyen:

- Ver la ubicación en tiempo real de la motocicleta en un mapa interactivo.

- Bloquear o desbloquear las ruedas de la motocicleta de manera remota.

- Desmontar el dispositivo de seguridad de la motocicleta de manera remota en caso de emergencia.

### Perfil del Usuario

![Gestión de Usuarios](/kampia-node-project/app_Imgs/DASHBOARD.jpg)

El sistema remoto web incluye un perfil de usuario que permite a los propietarios:

- Seleccionar y monitorear diferentes vehículos registrados.

- Ver información detallada de cada vehículo, incluyendo su ubicación en tiempo real, estado de bloqueo de las ruedas y nivel de carga de la batería del dispositivo.

- Personalizar las configuraciones de notificación y alerta para cada vehículo.

## Gestión Administrador

![Gestión de Usuarios](/kampia-node-project/app_Imgs/PANEL%20ADMINISTRATOR.jpg)


El sistema de gestión administrador está diseñado para que los administradores realicen las siguientes acciones:

- Crear usuarios y asignarles roles y permisos específicos.

- Registrar nuevos vehículos y asignarlos a usuarios registrados.

- Agregar dispositivos de seguridad y asignarlos a vehículos específicos.

- Gestionar las SIM cards utilizadas en los dispositivos de seguridad.

- Ver registros y registros de eventos, incluyendo actividades de usuarios y alertas.



## Instalación y Uso

### Configuración del Dispositivo

1. Instale el dispositivo de seguridad en su motocicleta siguiendo las instrucciones del manual.

2. Conecte el dispositivo a una fuente de alimentación adecuada.

3. Configure las opciones de seguimiento y alerta según sea necesario.

### Configuración del Sistema Remoto Web

1. Clone el repositorio del sistema remoto web en su servidor.

2. Instale las dependencias ejecutando `npm install`.

3. Configure las credenciales y la conexión con el dispositivo de seguridad en el archivo de configuración.

4. Inicie el servidor web con `npm run dev`.

5. Acceda al sistema remoto web a través de su navegador y regístrese como usuario.

6. Disfrute de las funciones de control y seguimiento del dispositivo de seguridad.


