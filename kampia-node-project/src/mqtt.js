import mqtt, { MqttClient } from 'mqtt';

//MQTT client configuration
export const client = mqtt.connect({
    host: 'broker.manicatogroup.com',
    port: 1883,
    clientId: 'Kampia_Nodejs_local3',
    keepalive: 60,
    reconnectPeriod: 1000,
    },
);

//MQTT topic list//
/*export const topicList = {
    'test': {qos: 0},
    'gps/#': {qos: 2}, 
    'control/#': {qos: 2},
    'solenoide/#': {qos: 1},
    'clientBroker/#':{qos: 2},
}*/

export const subTopics = {
  

    'res_controlMotorAccess_device/#':  {qos: 0},
    'res_controlCoverAccess_device/#':  {qos: 0},
    'res_motorStatusRemote_device/#':  {qos: 0},
    'res_solenoidOpenRemote_device/#':  {qos: 0},
    'res_updateDeviceStatus_device/#': {qos: 2},
    'res_gpsIntervalTimer_device/#':  {qos: 0},
    'res_updateRootStatus_device/#': {qos: 2},


    'clientBrokerConnection/#': {qos: 0},
    'kampia/status/data/gps_device/#':  {qos: 0},

    'kampia/controls/manual/motor/#': {qos: 0},
    'kampia/controls/manual/solenoid/#': {qos: 0},
    'kampia/response/controls/motor/#': {qos: 0},
    'kampia/response/controls/solenoid/#': {qos: 0},
    

    'kampia/response/permission/motor/#': {qos :0},
    'kampia/response/permission/solenoid/#': {qos :0},

    'kampia/response/config/IntervalGps/#': {qos :0},
    'kampia/response/update/status/#': {qos :0},
}

export const pubTopics = {
    'controlMotorAccess_plat/#':  {qos: 0},
    'controlCoverAccess_plat/#':  {qos: 0},
    'controls/remote/MOTOR/#':  {qos: 0},
    'solenoidOpenRemote_plat/#':  {qos: 0},
}



//funcion para comprobar la conexion
export function connectionMQTT(msg, topicSub, topicPub, msgPub){
    client.on('connect', (connack) =>{
        console.log(msg)
    })
} 
//function error connection Mqtt
export function errorConnectionMqtt(){
    client.on('error', (err)=>{
        try {
            setInterval(()=>{
                client.reconnect(); //intentar reconexion cada segundo
            }, 1000);
           
        } catch (error) {
            console.log('error en la conexion MQTT', err);
        }
       
    });
}
//funcion de subscription
export function subMqtt(topicSub, msg) {
    client.subscribe(topicSub, (err)=>{
        if(!err){
            client.publish(`subscripcion con ${topicSub} establecia`)
        }

        else{
            console.log(err);
        }
    })
}
//funcion para publicar
export function pubMqtt(topic, msg){
    client.publish(topic, msg, (err)=>{
        if(!err){
            console.log(`Mensaje enviado a ${topic}`);
        }

        else{
            console.log(err);
        }
    })
}

