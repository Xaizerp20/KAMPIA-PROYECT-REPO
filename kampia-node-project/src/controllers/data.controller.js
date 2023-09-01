import { connection } from "../db/mysql.js";

//query SQL para obtener la tabla de datos gps de la base de datos
export const getData = (req, res) => {
  connection.query("SELECT * FROM `datagps` WHERE 1", (err, results) => {
    res.json(results);
  });
};

//query SQL para obtener la tabla de datos de la base de datos segun el id del dispositivo
export const getDataDevice = (req, res) => {
  connection.query(
    "SELECT * FROM `datagps` WHERE id_device = ? AND (latt != 0 AND lng !=0);",
    [req.params.device],
    (err, results) => {
      res.json(results);
    }
  );
};

export const getDataStatus = (req, res) => {
  connection.query(
    "SELECT * FROM `datastatus` WHERE id_device = ?",
    [req.params.device],
    (err, results) => {
      res.json(results);
    }
  );
};

export const lastOpenSolenoid = (req, res) => {
  connection.query(
    "SELECT * FROM `datastatus` WHERE id_device = ? AND data = 'Open' order by id desc LIMIT 1",
    [req.params.device],
    (err, [results]) => {
      if(err){
        console.log(err)
      }
      else{
        res.json(results);
      }
    
    }
  );
};
