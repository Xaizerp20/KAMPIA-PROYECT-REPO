# 15-100-4-KAMPIA-SoftwarePlatform



- *Identificadores*
    * **id de dispositivo**: imei del radio
    * **id de vehiculo**: placa del vehiculo
    * **id de usuario**: DNI del usuario
    * **id de simCard**: PUK del simCard
   


- *Topic Sintaxis*

    Cada topico indica el dato que envia y recibe, para formar el topico se toma el tipo de dato + / seguido del id del dispositivo 
    
    **Ejemplo:** gps/A7276SA_1


- *MQTT TOPICS* 




*recived data information*

**MOTOR**
0 = BLOCKED
1 = UNLOCKED

**SOLENOIDE/COVER**
1 = OPENED


**MANUAL CONTROL ACCESS MOTOR**
0 = Restricted 
1 = Enabled

**MANUAL CONTROL ACCESS COVER**
0 = DENIED
1 = AUTHORIZED

**RESPONSE DEVICE CONTROL ACCESS MOTOR**
0 = "Not Receveid"
1 = Received