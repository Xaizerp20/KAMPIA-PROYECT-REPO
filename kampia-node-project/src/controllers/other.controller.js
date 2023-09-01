import { connection } from "../db/mysql.js";
import pages from '../directions.js'
import {io} from '../app.js'
import { client, subTopics, pubTopics, connectionMQTT, errorConnectionMqtt, pubMqtt, subMqtt } from '../mqtt.js'


//function to get solenoid access
export const getDBSolenoidAccess = (imei, pub) =>{
   
    connection.query(`SELECT cover_access FROM devices WHERE imei = '${imei}'`, (err, [result]) =>{
        if(err){
            console.log(err);
        }
        else{
         console.log(result)

         if(pub){

            switch(result.cover_access){
                case 'Authorized':  pubMqtt(`control_solenoide/${imei}`, 'solenoide,0');
                    break;
                case 'Denied':  pubMqtt(`control_solenoide/${imei}`, 'solenoide,1');
                    break
            }
           
         }
        }
    });
  
}


