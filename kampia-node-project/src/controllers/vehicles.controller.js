import { connection } from "../db/mysql.js";
import pages from '../directions.js'
import { io } from '../app.js'


//#region GET ALL VEHICLES
//query SQL para obtener la tabla de vehiculos de la base de datos
export const getVehicles = (req, res) => {
  connection.query(`SELECT * FROM vehicles WHERE 1`, (err, results) => {
    if (err) {

      console.log(err);

    }

    else {

      res.json(results);

    }
  });
};
//#endregion


//#region GET VEHICLE BY id OWNER
//query SQL para obtener la tabla de vehiculos de la base de datos segun el dni del usuario
export const getVehicle = (req, res) => {
  connection.query(`SELECT * FROM vehicles WHERE id_owner = ?`, [req.params.id_owner],
    (err, results) => {

      if (err) {
        console.log(err);
      }

      else {
        if (results.length <= 0) {
          res.status(404).send({ vehicle: "Not found vehicle" });
        } else {
          res.json(results);
        }
      }
    }
  );
};
//#endregion



//#region REGISTER VEHICLES
//query SQL para registrar los vehiculos y los dispositivos en la base de datos
export const createVehicle = (req, res) => {


  const veh_data = {
    veh: req.body.vehicles,
    plate: req.body.number_plate,
    brand: req.body.brand_company,
    model: req.body.vehicle_model,
    color: req.body.color
  }


  //comprobacion para saber si el vehiculo ya esta registrado
  connection.query(`SELECT * FROM vehicles WHERE number_plate = '${veh_data.plate}'`, (err, results) => {

    if (results.length != 0 && veh_data.plate === results[0].number_plate) {
      console.log("La placa del vehiculo ya esta registrada");
      res.sendFile(pages.pageAdmin);
      sendFront('La placa del vehiculo ya esta registrada');
    }
    else {

      connection.query(
        `INSERT INTO vehicles (number_plate, type_vehicle, marca, modelo, color) 
        VALUES (?, ?, ?, ?, ?)`, [veh_data.plate, veh_data.veh, veh_data.brand, veh_data.model, veh_data.color],
        (err, result) => {
          if (err) {
            console.error(err);
          }

          else {
            console.log('vehiculo agregado correctamente');
            res.sendFile(pages.pageAdmin);
            sendFront('vehiculo agregado correctamente');
          }

        })
    }
  })
}
//#endregion


//#region ASSING VEHICLES TO USERS
//query SQL para asignar los vehiculos a los usuarios en la base de datos
export const updateVehicle = (req, res) => {

  const dni = req.body.user;
  const veh = req.body.vehicle;

  console.log(dni, veh);


  connection.query(`SELECT id_user FROM users WHERE dni = ${dni}`, (err, [result]) => {

    const id = result.id_user;

    if (err) {
      console.log(err);
    }

    else {

      connection.query(`UPDATE vehicles SET id_owner = '${id}' WHERE number_plate = '${veh}'`, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log('vehiculo assignado correctamente');
          res.sendFile(pages.pageAdmin);
          sendFront('vehiculo assignado correctamente');

        }
      });
    }
  })



}
//#endregion



function sendFront(msg) {
  setTimeout(() => {
    io.emit('admin', msg)
  }, 1000)
}








