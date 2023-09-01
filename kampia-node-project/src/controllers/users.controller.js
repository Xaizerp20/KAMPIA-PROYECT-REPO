import { connection } from "../db/mysql.js";
import pages from '../directions.js'
import { io } from '../app.js'


//#region GET ALL USERS
//query SQL para obtener la tabla de usuarios de la base de datos
export const getUsers = (req, res) => {
  connection.query(`SELECT * FROM users`, (err, results) => {
    if (err) {
      console.error(err);
    }
    else {
      res.json(results);
    }
  });
};
//#endregion

//#region GET USER by DNI
//query SQL para obtener la tabla de usuarios de la base de datos segun el DNI
export const getUserDni = (req, res) => {
  connection.query(`SELECT * FROM users WHERE dni = ?`, [req.params.dni], (err, results) => {
    if (err) {
      console.error(err);
    }
    else {
      if (results.length <= 0) {
        res.status(404).send("Not found user");
      }
      else {
        res.json(results[0]);
      }
    }
  });
};
//#endregion

//#region AGREGAR USUARIOS

//query SQL para crear  usuarios  y agregarlos a la base de datos 
export const createUser = (req, res) => {

  //variables con los datos obtenidos del formulario
  const dni = req.body.user;
  const password = req.body.pass;
  const name = req.body.name;
  const perm = req.body.perm;

  const addUserQuery = `INSERT INTO users (dni, password, name, permission) VALUES ('${dni}', '${password}', '${name}', '${perm}')`;
  const validUserQuery = `SELECT * FROM users WHERE dni = '${dni}'`;

  //busqueda para saber si los datos estan repetidos segun el DNI 
  connection.query(validUserQuery, (err, results) => {

    //comprobamos si obtenemos algun dato y el usuario coincide
    if (results.length != 0 && dni === results[0].dni) {

      console.log("El DNI del usuario ya esta registrado");
      res.sendFile(pages.pageAdmin);
      sendFront("El DNI del usuario ya esta registrado")

    }

    else {
      //Agregamos los datos del nuevo usuario a la base de datos si el usuario no esta registrado
      connection.query(addUserQuery, (err, results) => {
        if (err) {
          console.error(err);
          return;
        }

        else {
          console.log('usuario agregado correctamente');
          res.sendFile(pages.pageAdmin);
          sendFront('usuario agregado correctamente')
        }

      });
    }
  });

};


//#endregion


//funcion para enviar datos al front
function sendFront(msg) {
  setTimeout(() => {
    io.emit('admin', msg);
  }, 1000);
};
