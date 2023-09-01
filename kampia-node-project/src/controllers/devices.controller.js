import { connection } from "../db/mysql.js";
import pages from '../directions.js'
import {io} from '../app.js'

//#region GET ALL DEVICES
//query SQL para obtener la tabla de dispositivos de la base de datos
export const getDevices = (req, res) => {
  connection.query(`SELECT * FROM devices`, (err, results) => {
    if(err){
      console.log(err);
    }
    else{
      res.json(results);
    }
  });
};
//#endregion


//#region GET DEVICE
//query SQL para obtener los datos de un dispositivo de la base de datos en funcion de la placa del vehiculo
export const getDevice = (req, res) => {
  const device = req.params.id_device
  connection.query(`SELECT * FROM devices WHERE id_device = '${device}'`, (err, [results]) => {
    if (err) {
      console.log(err);
    }
    else {
      if(!results){
        res.status(404).send({device: "Device not found"});
      }
      else{
        res.json(results);
      }
    }
  });
};
//#endregion


//#region REGISTER DEVICE
//query SQL para crear dispositivos en la base de datos
export const createDevice = (req, res) => {


  const DEV_DATA = {
    imei: req.body.id_device,
    company:req.body.company,
    model:req.body.model,
    version:req.body.version
  };

  //Comprobacion si el dispositivo ya esta registado en la base de datos
  connection.query(`SELECT * FROM devices WHERE imei = '${DEV_DATA.imei}'`, (err, results) => {

    if (results.length != 0 && DEV_DATA.imei === results[0].imei) {
      console.log("El imei del dispostivo ya esta registrado");
      res.sendFile(pages.pageAdmin);
      sendFront("El imei del dispostivo ya esta registrado");
    }

    else {
      connection.query(`INSERT INTO devices (imei, company, model, version) 
      VALUES (?, ?, ?, ?)`,[DEV_DATA.imei, DEV_DATA.company, DEV_DATA.model, DEV_DATA.version],
       (err, results) => {
        if (err) {
          console.error(err);
        }
        else {
          console.log('Dispositivo Agregado Correctamente');
          res.sendFile(pages.pageAdmin);
          sendFront('Dispositivo agregado correctamente')
        }
      });
    }
  });
}
//#endregion


//#region ASSING DEVICES
//query SQL para asignar los dispositivos a los vehiculos en la base de datos
export const updateDevice = (req, res) => {
  const device = req.body.device;
  const veh = req.body.vehicleDev;


  connection.query(`UPDATE vehicles SET id_device = '${device}' WHERE number_plate = '${veh}'`, (err, result) => {
    if (err) {
      console.log(err);

      if(err.errno == 1062){
        console.log('ERROR: El dispositivo ya tiene un vehiculo asignado');
        res.sendFile(pages.pageAdmin);
        sendFront('ERROR: El dispositivo ya tiene un vehiculo asignado');
      }

    }
    else {
      console.log('Dispositivo assignado correctamente');
      res.sendFile(pages.pageAdmin);
      sendFront('Dispositivo asignado correctamente')
    }
  });
}
//#endregion

//funcion para enviar datos al front
function sendFront(msg){
  setTimeout(()=>{
    io.emit('admin', msg)
  },1000) 
}






