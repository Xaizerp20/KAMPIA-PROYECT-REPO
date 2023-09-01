import express, { json, query, response } from 'express';
import path, { parse } from 'path';
import { fileURLToPath } from 'url';
import http from 'http'
import { connection } from './db/mysql.js'
import { client, subTopics, pubTopics, connectionMQTT, errorConnectionMqtt, pubMqtt, subMqtt } from './mqtt.js'
import { Server } from "socket.io";
import mainRoutes from './routes/main.routes.js'
import usersRoutes from './routes/users.routes.js'
import vehiclesRoutes from './routes/vehicles.routes.js'
import devicesRoutes from './routes/devices.routes.js'
import simcardRoutes from './routes/sim.routes.js'
import dataRoutes from './routes/data.routes.js';
import pages from './directions.js'
import sessionMiddleware from './middlewares/session.middleware.js';
import authMiddleware from './middlewares/auth.middleware.js';
import { getDBSolenoidAccess } from './controllers/other.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//SERVIDOR EXPRESS
const app = express();
const port = 3001;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//HTTP SERVER
const server = http.createServer(app)

//SERVER CONFIGURATION SCOKET IO
export const io = new Server(server);

//ROUTE STATICS FILES
const statics = path.resolve(pages.__dirname, 'public');

//MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());
app.use(express.static(statics));



//middleware de session
sessionMiddleware(app)
//middleware de autentificacion
authMiddleware(app);




//METODO POST PARA LOGIN DE USUARIO
app.post('/login', (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    //QUERY para buscar los datos ingresados por el usuario en la base de datos
    connection.query(`SELECT * FROM users  WHERE users.dni = ? AND users.password = ?`, [user, pass], (err, [results]) => {
        if (err) {
            console.error(err);
        }
        else {
            if (results) {

                //datos del usuario
                const user = {
                    id: results.id_user,
                    dni: results.dni,
                    name: results.name,
                    perm: results.permission
                };

                if (user.perm === 'user') { //comprobacion de permiso del usuario

                    req.session.user_id = user

                    console.log(`Login successful user: ${user.name}`);
                    res.redirect(`/map/${user.dni}`); //redirecion al mapa 

                    setTimeout(() => { //envio de los datos del usuario al front con retardo de 1s
                        console.log(user)
                        io.emit(user.dni, { user });
                    }, 1000);
                }
                else {
                    req.session.user_id = user.dni
                    console.log(`Login successful admin: ${user.name}`);
                    console.log(user);
                    res.redirect('/admin'); //redirecion si el usuario es administrador
                }
            }
            else {
                console.log('Login failed');
                res.redirect('/login'); //retorna al login si los datos de login son incorrectos
            }
        }
    });
});


//rutas principlaes
app.use(mainRoutes);
//rutas de usuarios
app.use(usersRoutes);
//rutas de vehiculos
app.use(vehiclesRoutes);
//rutas de dispositivos
app.use(devicesRoutes);
//rutas de simcard
app.use(simcardRoutes);
//rutas de datos
app.use(dataRoutes);



//reenvio de datos cuando se recarga la pagina 
app.get('/map/:dni', (req, res) => {

    if (!req.session.user_id) {
        res.redirect('/login');
    }

    else {
        setTimeout(() => {
            const user = { id: req.session.user_id.id, dni: req.session.user_id.dni }
            io.emit(req.session.user_id.dni, { user });
        }, 1000);
        res.sendFile(pages.pageMap)
    }

})

//PUERTO DEL SERVIDOR
server.listen(port, () => {
    console.log('listening on port', port);
});



//#region //------------MQTT CONTROLLER-----------//

//#region //----------MQTT CALLS INIT----------//
connectionMQTT('Conexion Mqtt Establecida'); //test MQTT connection
errorConnectionMqtt(); //test MQTT error and reconnection
pubMqtt('test', 'Enviado desde Nodejs:Express'); //test publish MQTT
subMqtt(subTopics); //topic subscription MQTT
const flags = {
    update: false
}
//#endregion

//#region  //--------FRONT RECEPCTION MESSAGES-------//
io.on('connection', socket => {
    socket.on('MQTT', data => {

        pubMqtt(data.topic, data.data);
        console.log("dato del front recibio:", data);


        if (data.topic.split('/')[0] === 'updateRootStatus_plat') {

            const id = data.topic.split('/')[1]

            pubMqtt(`motorStatusRemote_plat/${id}`, data.data);
            pubMqtt(`controlMotorAccess_plat/${id}`, data.data);
            pubMqtt(`controlCoverAccess_plat/${id}`, data.data);

        }


    });
});
//#endregion

//#region //--------MQTT MESSAGES RECEPCION--------//
client.on('message', function (topic, message) {

    const topicSplit = topic.split('/');
    const topicData = topicSplit[0]; //tipo de datos
    const topicId = topicSplit[4]; //id del dispositivo

    const cliendId_Connection = topicSplit[1];
    console.log("id device: " + cliendId_Connection);

    if (topic.includes('kampia/status/data/gps_device')) { //recepcion de datos del gps del dispositivo

        const msg = message.toString().split(',');
        
        msg.forEach(element => {

          
                console.log(msg[5])
                console.log(msg[7])
                console.log(msg[6])
                console.log(msg[8])
           
            
        });

        const coord = {
            latt: coordConvert(parseFloat(msg[5]), parseFloat(msg[7]), msg[6], msg[8]).latt,
            lng: coordConvert(parseFloat(msg[5]), parseFloat(msg[7]), msg[6], msg[8]).lng,
        }

        console.log(coord);

        var lat = 0, lon = 0; //latitud //longitud

        if (isNaN(coord.latt) && isNaN(coord.lng)) {
            lat = 0;
            lon = 0;
        }
        else {
            lat = coord.latt
            lon = coord.lng
        }

        console.log(`GPS de ${topicId}`, `Latt: ${lat}`, `Lng: ${lon}`)

        var values = []



        try{

            connection.query(`SELECT id_device FROM devices WHERE imei = '${topicId}'`, (err, [results]) => {
                if (err) {
                    console.log(err);
                }
                else {
                    
                    values = [results.id_device, lon, lat];

                    //registro de datos del dispositivo en la base de datos del gps entrante
                    connection.query('INSERT INTO datagps (id_device, latt, lng) VALUES (?, ?, ?)', values, (err, results) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        else {
                            //busqueda de los datos
                            connection.query(`SELECT *
                    FROM devices
                    JOIN vehicles
                    ON devices.id_device = vehicles.id_device
                    JOIN users
                    ON vehicles.id_owner = users.id_user
                    WHERE devices.imei = ?
                    `, [topicId], (err, [data]) => {
                                if (err) {
                                    console.error(err);
                                }
                                else {
                                    console.log(`Datos Gps de ${topicId} Registrados con exito`);
                                    //envia el dato registrado al mapa en tiempor real
                                    const liveData = {
                                        dni: data.dni, //dni del usuario
                                        id_device: topicId, //id del dispositivo
                                        lat: lat, //latitud
                                        lon: lon, //longitud
                                    };

                                    io.emit(data.dni, { liveData }); //envio de datos reicibidos
                                    console.log(`Datos Gps de ${topicId} enviados en tiempo real`);
                                }
                            })
                        }
                    });


                }
            })
        }
        catch(error){
            console.error(error.message);
            return;
        }


    }

    else if (topic.includes('kampia/controls/manual/motor')) { //bloqueo/desbloqueo del motor con el control manual

        //const statusInt = parseInt(message.toString().split(',')[1]);
        const status = parseInt(message);

        let statusMotor = '';

        statusMotor = (!status ? "Blocked" : "Unlocked");



        connection.query(`SELECT id_device FROM devices WHERE imei = '${topicId}'`, (err, [result]) => {
            const id_device = result.id_device

            connection.query('INSERT INTO datastatus(id_device, topic, data) VALUES (?, ?, ?)', [id_device, 'motor', statusMotor],
                (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        connection.query(`UPDATE devices SET status_int = '${statusMotor}' WHERE imei = '${topicId}'`);
                        io.emit(`control/${topicId}`, statusMotor) //envio del estado al front
                        console.log(`Cambio manual de estado motor de ${topicId} registrado: ${statusMotor}`)
                    }

                }

            )
        });

    }

    else if (topic.includes('kampia/controls/manual/solenoid')) { //apertura del cover con el control manual 

        let statusCover = parseInt(message);

        if (statusCover) {
            connection.query(`
            SELECT devices.id_device, vehicles.id_owner, users.dni
            FROM devices
            JOIN vehicles 
            ON vehicles.id_device = devices.id_device
            JOIN users
            ON vehicles.id_owner = users.id_user
            WHERE imei = '${topicId}'`, (err, [result]) => {
                if (err) {
                    console.log(err);
                }
                else {
                    const id_device = result.id_device;
                    const dni = result.dni;

                    connection.query(`INSERT INTO datastatus(id_device, topic, data) VALUES('${id_device}', 'solenoid', 'Open')`, (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(`Apertura manual de Cover del dispositivo ${topicId} registrada: ${getDateTime()}`)
                            const open = Boolean(message.toString())
                            io.emit(dni, { id: topicId, open });
                        }
                    });
                }
            });
        }
    }

    else if (topic.includes("kampia/response/permission/motor")) { //respuesta cuando se habilita/deshabilita el control manual del motor

        const status = parseInt(message);

        connection.query(`UPDATE devices SET status_plat = '${status ? 'Enabled' : 'Restricted'}' WHERE imei = '${topicId}'`,
            (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(`acesso al control manual del dispositivo ${topicId} actualizado: ${status ? 'Enabled' : 'Restricted'}`);

                    getDni(topicId).then((dni) => {
                        io.emit(dni, { id: topicId, resManualAccessMotor: status });
                    })

                }

            }
        );

    }

    else if (topic.includes('kampia/response/permission/solenoid')) {//respuesta cuando se habilita/deshabilita el control manual del solenoide

        const solenoid = parseInt(message);

        connection.query(`UPDATE devices SET cover_access = '${solenoid ? 'Authorized' : 'Denied'}' WHERE imei = '${topicId}'`,
            (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(`acesso al control manual del cover del dispositivo ${topicId} actualizado: ${solenoid ? 'Authorized' : 'Denied'}`);

                    getDni(topicId).then((dni) => {
                        io.emit(dni, { id: topicId, resManualAccessSolenoid: solenoid });
                    })

                }
            })
    }

    else if (topic.includes("kampia/response/controls/motor")) {//respuesta cuando se bloquea o desbloquea el motor via remoto

        const status = parseInt(message);

        let statusMotor = '';

        statusMotor = (!status ? "Blocked" : "Unlocked");



        connection.query(`SELECT id_device FROM devices WHERE imei = '${topicId}'`, (err, [result]) => {
            const id_device = result.id_device

            connection.query('INSERT INTO datastatus(id_device, topic, data) VALUES (?, ?, ?)', [id_device, 'motor', statusMotor],
                (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        connection.query(`UPDATE devices SET status_int = '${statusMotor}' WHERE imei = '${topicId}'`);
                        io.emit(`control/${topicId}`, statusMotor) //envio del estado al front
                        console.log(`Cambio remoto de estado motor de ${topicId} registrado: ${statusMotor}`)
                    }

                }

            )
        });
    }

    else if (topic.includes("kampia/response/controls/solenoid")) {//respuesta cuando se activa la solenoide de manera remota
        let statusCover = parseInt(message);

        if (statusCover) {
            connection.query(`
            SELECT devices.id_device, vehicles.id_owner, users.dni
            FROM devices
            JOIN vehicles 
            ON vehicles.id_device = devices.id_device
            JOIN users
            ON vehicles.id_owner = users.id_user
            WHERE imei = '${topicId}'`, (err, [result]) => {
                if (err) {
                    console.log(err);
                }
                else {
                    const id_device = result.id_device;
                    const dni = result.dni;

                    connection.query(`INSERT INTO datastatus(id_device, topic, data) VALUES('${id_device}', 'solenoid', 'Open')`, (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(`Apertura remota de Cover del dispositivo ${topicId} registrada: ${ getDateTime()}`)
                            const open = Boolean(message.toString())
                            io.emit(dni, { id: topicId, open });
                        }
                    });
                }
            });
        }
    }

    else if (topic.includes("kampia/response/config/IntervalGps")) {//respuesta cuando se cambia el intervalo de envio de gps

        const resGpsInterval = parseInt(message.toString());


        connection.query(`UPDATE devices SET gps_Interval = ${resGpsInterval} WHERE imei = '${topicId}'`, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {

                getDni(topicId).then((dni) => {
                    io.emit(dni, { resGpsInterval, id: topicId })
                })
                console.log("Intervalo de envio de gps cambiado correctamente a: " + resGpsInterval + " segundos");
            } 
        })





    }

    else if (topicData === "kampia/response/update/status") {//respuesta de actualizacion de datos en el dispositivo

        let updateState = 1;

        getDni(topicId).then((dni) => {
            flags.update = true;
            console.log(`Actualizacion de estados del dispositivo ${topicId} recibida con exito`);
            io.emit(dni, { updateState, id: topicId })
        })


    }

    else if (topicData === "res_updateRootStatus_device") {

        const adminRoot = parseInt(message.toString());

        connection.query(`UPDATE devices SET admin_status = '${adminRoot === 1 ? 'Enabled' : 'Disabled'}' WHERE imei = '${topicId}'`, (err, results) => {
            if (err) {
                console.log(err);
            }
            else {

                getDni(topicId).then((dni) => {
                    console.log(`Restriccion total del dispositivo ${topicId} por administrador: ${adminRoot === 1 ? 'Enabled' : 'Disabled'}`);
                    io.emit(dni, { adminRoot, id: topicId })
                    io.emit('admin', { id: topicId, res_updateRoot: `${adminRoot === 1 ? 'Enabled' : 'Disabled'}` });
                })

            }
        })




    }

    else if (topicData === "clientBrokerConnection" && cliendId_Connection.includes('A7276SA')) { //conexion y desconexion de dispositivos

        let status;
        if (JSON.parse(message.toString()).status === "client.connected") {
            status = "Connected";
        }

        else {
            status = "Disconnected";
        }


        //Actualizacion del estado de conexion del dispositivo en la base de datos
        connection.query(`UPDATE devices SET connection = '${status}' WHERE imei = '${cliendId_Connection}'`, (err, results) => {
            if (err) {
                console.log(err);
            }
            else {

                connection.query(`SELECT id_device FROM devices WHERE imei = '${cliendId_Connection}'`, (err, [result]) => {
                    const id_device = result.id_device

                    connection.query('INSERT INTO datastatus(id_device, topic, data) VALUES (?, ?, ?)', [id_device, 'connection', status],
                        (err, result) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log(`Cambio de conexion de dispositivo ${cliendId_Connection} registrado: ${status}`);

                                connection.query(`
                                    SELECT users.dni, devices.connection, devices.status_int, devices.status_plat, devices.cover_access
                                    FROM devices
                                    JOIN vehicles 
                                    ON vehicles.id_device = devices.id_device
                                    JOIN users
                                    ON users.id_user = vehicles.id_owner
                                    WHERE devices.imei = '${cliendId_Connection}'`, (err, [results]) => {
                                    const dni = results.dni
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        if (results.connection === "Connected") {
                                            flags.update = false;
                                            
                                            /*
                                            setTimeout(()=>{
                                                pubMqtt(`kampia/controls/remote/motor/${cliendId_Connection}`, `${results.status_int === "Unlocked" ? "o_motor" : "c_motor"}`);
                                            }, 1000);

                                            setTimeout(()=>{
                                                pubMqtt(`kampia/permission/manual/motor/${cliendId_Connection}`, `${results.status_plat === "Enabled" ? "uc_motor" : "bc_motor"}`);
                                            }, 3000);

                                            setTimeout(()=>{
                                                pubMqtt(`kampia/permission/manual/solenoid/${cliendId_Connection}`, `${results.status_int === "Authorized" ? "uc_solenoid" : "bc_solenoid"}`);
                                            }, 5000);
                                            /*
                                            setTimeout(()=>{
                                                pubMqtt(`kampia/update/status/${cliendId_Connection}`, `u_device`);
                                            }, 1000);
                                           
                                            */
                                            
                                           

                                        }
                                        io.emit(dni, { status, id: cliendId_Connection })
                                    }
                                })
                            }

                        }

                    )

                });
            }
        })
    }

    else { //si se recibe cualquier otro dato

        console.log('Dato Desconocido: ', message.toString());
        console.log(topic);
    }
});
//#endregion

//#endregion




//#region OTHER FUNCTIONS
function coordConvert(dlatt, dlng, ns, ew) {
    /*
    var degreesLatt = Math.floor(dlatt / 100);
    var minutesLatt = dlatt - degreesLatt * 100;
    var decimalLatt = degreesLatt + minutesLatt / 60;

    var degreesLng = Math.floor(dlng / 100);
    var minutesLng = dlng - degreesLng * 100;
    var decimalLng = degreesLng + minutesLng / 60;
    */



    if (ns === 'S') {
       // decimalLatt = decimalLatt * -1;
       dlatt = decimalLatt * -1
    }
    else {
       // decimalLatt = decimalLatt;
    }

    if (ew === 'W') {
        //decimalLng = decimalLng * -1;
        dlng = dlng * -1
    }
    else {
       // decimalLng = decimalLng;
    }

    /*
    const coord = {
        latt: decimalLatt,
        lng: decimalLng
    }
    */

    const coord = {
        latt: dlatt,
        lng: dlng
    }

    return coord;
};

function getDateTime() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    var date = day + '/' + month + '/' + year;

    var hours = currentDate.getHours().toString().padStart(2, '0');
    var minutes = currentDate.getMinutes().toString().padStart(2, '0');
    var seconds = currentDate.getSeconds().toString().padStart(2, '0');
    var time = hours + ':' + minutes + ':' + seconds;

    return date + " " + time;
};

//funcion para obtener el dni del usuario
async function getDni(id) {

    try {
        const [results] = await new Promise((resolve, reject) => {
            connection.query(`
            SELECT users.dni
            FROM devices
            JOIN vehicles 
            ON vehicles.id_device = devices.id_device
            JOIN users
            ON users.id_user = vehicles.id_owner
            WHERE devices.imei = '${id}'`, (err, results) => {
                const dni = results.dni
                if (err) {
                    reject(err);
                }
                else {
                    resolve(results)
                }
            })
        });

        return results.dni;
    }

    catch (error) {
        console.log(error);
    }

}

//#endregion

