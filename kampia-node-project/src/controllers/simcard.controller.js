import { connection } from "../db/mysql.js";
import pages from '../directions.js'
import { io } from '../app.js'


//#region GET ALL SIMCARDS 
export const getAllSim = (req, res) => {
  connection.query(`SELECT * FROM simcard`, (err, results) => {
    if (err) {
      console.log(err);
    }
    else {
      res.json(results);
    }
  });
};
//#endregion

//#region GET A SIMCARD BY ID
export const getSim = (req, res) => {
  connection.query(`SELECT * FROM simcard WHERE id = ${req.params.id}`,
    (err, [results]) => {
      if (err) {
        console.log(err);
      }
      else {
        res.json(results);
      }
    });
};
//#endregion


//#region CREATE SIMCARD
export const createSim = (req, res) => {

  //variables con los datos obtenidos del formulario
  const sim = req.body.number_sim;
  const provider = req.body.provider;
  const phone = req.body.phone;
  


  connection.query(`SELECT * FROM simcard WHERE number = ${sim} OR number_phone = ${phone}`, (err, result) => {
    if(result.length != 0 && sim === result[0].number){
      console.log("Registro Duplicado");
      res.sendFile(pages.pageAdmin);
      sendFront("Registro Duplicado");
    }

    else{
      connection.query(`INSERT INTO simcard(number, provider, number_phone) VALUES ('${sim}', '${provider}', '${phone}')`, 
      (err, results) =>{
        if(err){
          console.error(err);
          res.sendFile(pages.pageAdmin);
        }

        else{
          console.log('SimCard agregada correctamente');
          res.sendFile(pages.pageAdmin);
          sendFront('SimCard agregada correctamente')
        }
      })
    }
  })
}
//#endregion

//#region ASSING SIMCARD

export const updateSimcard = (req, res) => {

  const device = req.body.Devsim;
  const sim = req.body.sim;

  console.log(device, sim);

      connection.query(`UPDATE devices SET id_simcard = '${sim}' WHERE id_device = '${device}'`, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log('Simcard assignado correctamente');
          res.sendFile(pages.pageAdmin);
          sendFront('Simcard assignado correctamente');

        }
      });
    
}


function sendFront(msg) {
  setTimeout(() => {
    io.emit('admin', msg);
  }, 1000);
};
