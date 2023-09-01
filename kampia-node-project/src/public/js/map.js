//etiquetas con la informacion del usuario
const user = document.getElementById('name');
const dni = document.getElementById('dni');

//etiquetas con la informacion del vehiculo
const plate = document.getElementById('plate');
const typeVeh = document.getElementById('typeVeh')
const devices = document.getElementById('devices');
const selectVeh = document.getElementById('selectVeh'); //selector de vehiculos
const color = document.getElementById('color');
const model = document.getElementById('model');
const img_veh = document.getElementById('img_veh')
const selectVehAlert = document.getElementById('selectVehAlert');


//etiquetas con la informacion del dispositivo
const imgDeviceBattery = document.getElementById('imgDeviceBattery')
const deviceId = document.getElementById('deviceId');
const conn = document.getElementById('conn');
const latt = document.getElementById('latt');
const lng = document.getElementById('lng');
const manControl = document.getElementById('manControl');
const remControl = document.getElementById('remControl');
const protect = document.getElementById('protect');
const led = document.getElementById('led');
const textStatus = document.getElementById('textStatus');
const lastOpen = document.getElementById('lastOpen');

//etiquetas informacion de la simCard
const numberSim = document.getElementById('numberSim');
const provider = document.getElementById('provider');
const numberPhone = document.getElementById('numberPhone');

//botones para controlar el dispositivo 
const deviceControl = document.getElementById('deviceControl');
const iconDevice = document.getElementById('iconDevice');

//botoner para controlar el solenoide
const coverControl = document.getElementById('coverControl');
const iconCover = document.getElementById('iconCover');

//boton para desbloquear y bloquear el motor del dispositivo
const remoteControlMotor = document.getElementById('flexSwitchCheckDefault');
const controlremoto = document.getElementById('controlremoto');

//botones de administrador
const adminOpen = document.getElementById('adminOpen');
const changeTab = document.getElementById('profile-tab')
const hometab = document.getElementById('home-tab')
var flagDev = false;


const buttonContainer = document.getElementById('buttonContainer');

const waitIcon = document.getElementById('waitIcon');
const waitIconGpsInterval = document.getElementById('waitIconGpsInterval');

const waitIcon2 = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
<span class="visually-hidden">Loading...</span>`;



const customRange2 = document.getElementById('customRange2');
const gpsInterval = document.getElementById('gpsInterval');
const containerRange = document.getElementById('containerRange');


const flag = {
    resInterval:false,
    remoteMotor:false,
    remoteCover:false,
    accessMotor:false,
    accessCover:false,
    dashboard: false,
}

const admin = {
    status: false,
}


const socket = io();
let marker;
let map;
const dniUrl = location.href.split('/')[4] //url con el dni del usuario
var id_device = { id: 0 };




//fetch get API data
async function getFetch(route, id) {
    let result;
    await fetch(`${route}/${id}`, { method: 'GET' })
        .then(response => response.text())
        .then(data => {
            data = JSON.parse(data) //convertimos los datos en a formato JSON
            result = data;
        });
    console.log(result)
    return result
}



//obtiene los datos del usuario que se logea en funcion del DNI
socket.on(dniUrl, (data) => {

    if (data.user) {
        changeTab.disabled = true;
        if (dniUrl === data.user.dni) {
           
            //call funcion para obtener el nombre y el dni del usuario en base al dni del usuario
            getFetch('/user', data.user.dni).then(data => {

                user.innerHTML = data.name; //asignacion del nombre en el front
                dni.innerHTML = data.dni;   //asignacion del dni en el front
            });

            //call funcion para obtener los vehiculos y la placa en base al id del usuario
            getFetch('/vehicle', data.user.id).then((data) => {

                const type = {};

                if (data.vehicle) { //comprobacion si el usuario tienen vehiculos
                    alert('Este usuario no tiene vehiculos asignados');
                    return
                }


                //iteracion para asignar los vehiculos disponibles en el front
                data.forEach(element => {
                    //datos del vehiculo
                    const dataVeh = {
                        id_device: element.id_device,
                        id_owner: element.id_owner,
                        plate: element.number_plate,
                        type_vehicle: element.type_vehicle,
                        color: element.color,
                        brand: element.marca,
                        model: element.modelo
                    }


                    const option = document.createElement("option");

                    option.text = dataVeh.plate;
                    option.value = JSON.stringify(dataVeh);

                    const arrayNew = []
                    for (let index = 0; index < selectVeh.options.length; index++) {
                        const element =  selectVeh.options[index].text;
                        arrayNew.push(element);
                    }

                    if(arrayNew.indexOf(option.text) == -1){
                        selectVeh.add(option); //opciones para el selector de vehiculo (JSON)
                       
                    }
                   
                    type[plate] = dataVeh.type_vehicle; 
                });

                //evento para seleccion de vehiculos
                selectVeh.onchange = function dataFront() {

                    changeTab.disabled = false;
                    imgDeviceBattery.style.display = 'block';
                    const selectedOption = selectVeh.options[selectVeh.selectedIndex];
                    const dataVeh = JSON.parse(selectedOption.value);


                    plate.innerHTML = dataVeh.plate//asignacion de placa en el front
                    typeVeh.innerHTML = dataVeh.type_vehicle;
                    color.innerHTML = dataVeh.color; //asignacion de color
                    model.innerHTML = dataVeh.model; //asingacion de modelo
                    id_device.id = dataVeh.id_device;


                    switch (dataVeh.type_vehicle) {
                        case "car": img_veh.src = "/imgs/car.png";
                            break;
                        case "motorbike": img_veh.src = "/imgs/moto.png";
                            break;
                        case "truck": img_veh.src = "/imgs/truck.png";
                            break;

                    }


                    //llamada funcion pra obtener los dispositivos en base a la placa 
                    getFetch('/device', dataVeh.id_device).then(data => {

                        //datos del dispositivo
                        const dataDevice = {
                            imei: data.imei,
                            model: data.model,
                            connection: data.connection,
                            status_int: data.status_int,
                            status_plat: data.status_plat,
                            cover: data.cover_access,
                            gps_Interval: data.gps_Interval,
                            admin_status: data.admin_status,
                            id_simcard: data.id_simcard
                        }

                        //comprobacion para saber si el vehiculo tiene dispositivos asignados
                        if (data.device) {

                            const tags = [devices, deviceId, textStatus, latt, lng, manControl, remControl, protect];

                            flagDev = false;
                            alert('Este vehiculo no tiene un dispositivo asignado');
                            tags.forEach(tag => tag.innerHTML = "");
                            led.style.display = "none";

                            return
                        }

                        else {

                            flagDev = true;

                            devices.innerHTML = dataDevice.imei; //asignacion de disposito en el front
                            deviceId.innerHTML = dataDevice.imei; //asignacion de disposito en el front
                            manControl.innerHTML = dataDevice.status_int; //asignacion del control manual
                            remControl.innerHTML = dataDevice.status_plat; //asingacion del control remotor
                            protect.innerHTML = dataDevice.cover; //asignacion del protector
                            gpsInterval.innerHTML = `${dataDevice.gps_Interval}s`; 
                            customRange2.value =  dataDevice.gps_Interval; 
                            textStatus.innerHTML = data.connection;   //asginacion del status del dispositivo 

                        }


                        
                        iconDevice.innerHTML = ` ${dataDevice.status_plat === "Enabled" ? " Enabled" : " Restricted"}`;
                        iconDevice.className = `fa fa-lock${dataDevice.status_plat === "Enabled" ? "-open" : ""}`
                        remControl.innerHTML = `${dataDevice.status_plat === "Enabled" ? "Enabled" : "Restricted"}`;
                        remoteControlMotor.checked = dataDevice.status_int == 'Unlocked';

                        iconCover.innerHTML = ` ${dataDevice.cover === "Authorized" ? " Authorized" : " Denied"}`;
                        iconCover.className = `fa fa-lock${dataDevice.cover === "Authorized" ? "-open" : ""}`
                        adminOpen.disabled = dataDevice.cover === "Authorized";           
                        
                  
                        updateLEDStatus(data.connection, dataDevice.admin_status === 'Enabled' ? true : false);
                        admin.status =  dataDevice.admin_status === 'Enabled' ? true : false;
                        console.log(admin);

                        //evento para obtener el status de motor del dispositivo por Mqtt
                        socket.on(`control/${dataDevice.imei}`, (data)=> {

                            flag.remoteMotor = true; //true flag si hay respuesta
                            manControl.innerHTML = data
                            remoteControlMotor.checked = data == 'Unlocked';
                            waitIcon.className = "d-none";
                            buttonContainer.className= "d-flex justify-content-center";
                            alert(`Cambio de estado del motor del dispositivo: ${data}`)
                            
                        })


                        getFetch('/sim', dataDevice.id_simcard).then(data => {

                            const tags = [numberSim, provider, numberPhone];
                            const prop = ['number', 'provider', 'number_phone'];
                            tags.forEach((tag, index) => { tag.innerHTML = data[prop[index]] });

                        })
                    })

                    getFetch('/dataSolenoid', dataVeh.id_device).then((data) => {
                        lastOpen.innerHTML = DateConverteIso(data.date);

                    });

                };

            });
        }
    }
});



//funcion para enviar mensajes por mqtt al pulsar los botones
function handleClick(button, topic) {
    button.addEventListener('click', () => {

        let data = "";

        if (deviceId.innerHTML != "") {

            //permite habilitar O deshabilitar(bloqueo tambien) el control manual del motor
            if (button === deviceControl) {
                
                if (iconDevice.innerHTML.trim() === "Enabled") {
                    
                    data = "bc_motor"; //enabled
                    deviceControl.disabled = true;
                }
                else {
 
                    data = "uc_motor"; //restricted
                    deviceControl.disabled = true;
                }


                flag.accessMotor = false;
                setTimeout(() => {
                    console.log(flag.accessMotor)
                    if(!flag.accessMotor){
                       alert("Error al cambiar el acceso al control del motor, intente otra vez");
                       deviceControl.disabled = false;
                    }
                }, 10000);

            }
            //permite habilitar O deshabilitar el control manual del solenoide
            else if (button === coverControl) {

                if (iconCover.innerHTML.trim() === "Authorized") {
                    data = "bc_solenoid"; //autorizar
                    coverControl.disabled = true;
                }
                else {
                    data = "uc_solenoid"; //denegar
                    coverControl.disabled = true;
                }

                
                flag.accessCover = false;
                setTimeout(() => {
                    console.log(flag.accessCover)
                    if(!flag.accessCover){
                       alert("Error al cambiar el acceso al control del Cover, intente otra vez");
                       coverControl.disabled = false;
                    }
                }, 10000);
            }
            //abre de manera remota el solenoide
            else if (button === adminOpen) {
                adminOpen.disabled = true;
                adminOpen.innerHTML = waitIcon2;
                data = "o_solenoid";
                flag.remoteCover = false;

                setTimeout(() => {
                    if(!flag.remoteCover){
                        adminOpen.disabled = false;
                        adminOpen.innerHTML = "OPEN DEVICE"
                        alert("Error al abrir el cover, intente otra vez");
                    }
                }, 10000);
            }
            socket.emit('MQTT', { topic: `${topic}/${deviceId.innerHTML}`, data: `${data}`});
            //socket.emit('MQTT', { topic: `${topic}/${deviceId.innerHTML}`, data: `${data}`});
        }
    });
}


//llama de funciones para enviar mensajes por mqtt al pulsar los botones
handleClick(deviceControl, 'kampia/permission/manual/motor');
handleClick(coverControl, 'kampia/permission/manual/solenoid');
handleClick(adminOpen,  'kampia/controls/remote/solenoid');



//bloqueo y desbloqueo remoto del motor
remoteControlMotor.addEventListener('change', (e)=>{
    let data = "";
    topic = 'kampia/controls/remote/motor';

    if(e.target.checked){
       data = 'o_motor' //UNLOCK
    }
    else{
        data = 'c_motor' //BLOCK
    }

    waitIcon.className = "spinner-border d-flex justify-content-center";
    buttonContainer.className= "d-none";
    flag.remoteMotor = false;

    socket.emit('MQTT', { topic: `${topic}/${deviceId.innerHTML}`, data: `${data}`});

    setTimeout(() => {
        if(!flag.remoteMotor){
            alert('Error al cambiar el estado intente otra vez');
            waitIcon.className = "d-none";
            buttonContainer.className= "d-flex justify-content-center";
            remoteControlMotor.checked = manControl.innerHTML === "Unlocked";
        }
    }, 10000);
})



async function waitForDevices() {
    while (!devices.innerHTML) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

//funcion para crear el mapa 
async function initMap() {
    await waitForDevices();
    console.log("id del dispositivo " + id_device.id)
    const result = await getFetch('/data', id_device.id) //llamada funcion para obtener datos de gps segun el id del dispositivo

    coord = {
        lat: result[result.length - 1].latt, //ultima latitud de la base de datos
        lng: result[result.length - 1].lng, //ultima longitud de la base de datos
    }
  

  

    if (flagDev == true) {

        latt.innerHTML = coord.lat; //asignacion latitud en el front
        lng.innerHTML = coord.lng; //asignacion longitud en el front
        
    }


    //creacion del mapa 
    map = new google.maps.Map(document.getElementById("map"), {
        center: coord,
        zoom: 8,
    });


    //marca del mapa
    marker = new google.maps.Marker({
        position: coord,
        map,
        title: "Hello World",
    });

    //informacion del label de la marca
    function infoviewContent() {
        return [
            "device Id: " + result[0].id_device,
            "Lat: " + coord.lat,
            "lng: " + coord.lng,
        ].join("<br>" + "</br>");
    }

    //label de la marca
    const infowindow = new google.maps.InfoWindow({
        content: `<div style='width:300px; height:150px; font-size:20px;'>${infoviewContent()}</div>`,
        pixelOffset: new google.maps.Size(0, -30)

    });


    //evento click de la marca en el mapa
    marker.addListener("click", () => {
        map.setZoom(15);
        map.setCenter(marker.getPosition());
        console.log(marker.getPosition().toString())
        infowindow.open(map, marker);
    })

    
}

//evento de selecion del vehiculo para recrear el mapa con los datos
selectVeh.addEventListener('change', initMap);


//#region //-----------LISTERNERS MQTT--------------------//

//Escucha cada vez que recibe un nuevo dato por MQTT usando el DNI del usuario
socket.on(dniUrl, (data) => {

    if (data.liveData) { //si el dato recibido es de gps

        if (dniUrl === data.liveData.dni && data.liveData.id_device === deviceId.innerHTML) {


            const lat = data.liveData.lat; //latitude mqtt
            const lon = data.liveData.lon; //longitude mqtt

            if(lat != 0 && lon != 0) {
                latt.innerHTML = coord.lat = lat; //asignacion nueva latitud al mapa
                lng.innerHTML = coord.lng = lon;  //asignacion nueva longitud al mapa
                
                function infoviewContent() {
                    return [
                        "device Id: " + deviceId.innerHTML,
                        "Lat: " + lat,
                        "lng: " + lon
                    ].join("<br>" + "</br>");
                }
            
                //label de la marca
                const infowindow = new google.maps.InfoWindow({
                    content: `<div style='width:300px; height:150px; font-size:20px;'>${infoviewContent()}</div>`,
                    pixelOffset: new google.maps.Size(0, -30)
            
                });


                marker.setPosition(coord); //reposicion de marca del mapa
                map.setCenter(marker.getPosition());  //centramiento del mapa
                infowindow.open(map, marker);
            }

        }
    }

    else if (data.status) { //cambio del estado del dispositivo (conexion/desconexion)

        const statusConn = data.status;
        if (data.id == deviceId.innerHTML) {
 
            updateLEDStatus(statusConn, admin.status);
            textStatus.innerHTML = statusConn; //asignacion del nuevo status
        }
    }

    else if (data.open && data.id === deviceId.innerHTML) { //apertura del solenoide de manera manual

        lastOpen.innerHTML = getDateTime(); //ultima fecha y hora de apertura del dispositivo
        adminOpen.disabled = true;
        adminOpen.innerHTML = waitIcon2;
        flag.remoteCover = true;
        
        setTimeout(() => {
            alert(`Cover del dispositivo abierto: ${lastOpen.innerHTML}`);
            adminOpen.disabled = false;
            adminOpen.innerHTML = "OPEN DEVICE"
        }, 5000)
    }

    else if(data.resManualAccessMotor != undefined && data.id === deviceId.innerHTML){
        
        iconDevice.innerHTML  = (data.resManualAccessMotor) ? " Enabled" : " Restricted";
        iconDevice.className = `fa fa-lock${(data.resManualAccessMotor) ? "-open" : ""}`;
        remControl.innerHTML = (data.resManualAccessMotor) ? "Enabled" : "Restricted";
        deviceControl.disabled = false;
        flag.accessMotor = true;
        alert(`Acesso al control manual del motor actualizado Correctamente: ${(data.resManualAccessMotor) ? "Enabled" : "Restricted"}`);
    }

    else if(data.resManualAccessSolenoid != undefined && data.id === deviceId.innerHTML){ 
        console.table(data.resManualAccessSolenoid)
        iconCover.innerHTML  = (data.resManualAccessSolenoid) ? " Authorized" : " Denied";
        iconCover.className = `fa fa-lock${(data.resManualAccessSolenoid) ? "-open" : ""}`
        coverControl.disabled = false;
        flag.accessCover = true;
        alert(`Acesso al control manual del cover actualizado Correctamente: ${(data.resManualAccessSolenoid) ? "Authorized" : "Denied"}`);
    }
    //respuesta para cambio de intervalos de envio de gps
    else if(data.resGpsInterval != undefined && data.id === deviceId.innerHTML){

        flag.resInterval = true;
        alert("Intervalo de envio de Gps actualizado Correctamente");
        waitIconGpsInterval.className = "d-none";
        containerRange.className = "d-flex flex-column justify-content-center";
        gpsInterval.innerHTML = `${data.resGpsInterval}s`; 
        customRange2.value = data.resGpsInterval; 
    }

    else if(data.adminRoot != undefined && data.id === deviceId.innerHTML){

    
        manageButtons(textStatus.innerHTML, (data.adminRoot) ? true : false);
        admin.status = (data.adminRoot) ? true : false;
        console.log(admin.status)

    }

    else if(data.updateState != undefined && data.id === deviceId.innerHTML){
        alert('Todos los datos del dispositivo fueron actualizados');
        console.log(textStatus.innerHTML, admin.status);
        manageButtons(textStatus.innerHTML, admin.status);
    }

    else { //recepcion de cualquier otro dato desconocido por mqtt

        console.log('Datos MQTT desconocidos', data);

    }

});
//#endregion


var timeMs = 0;

//#region //FUNCIONES PARA CAMBIO DE INTERVALO ENVIOS DE GPS
customRange2.addEventListener('input', (e) => {
   // gpsInterval.innerHTML = e.target.value;
    
});
customRange2.addEventListener('mouseup', (e) => {
    const data = parseInt(e.target.value);
    socket.emit('MQTT', { topic: `kampia/config/IntervalGps/${deviceId.innerHTML}`, data: `${data}`});
    
    containerRange.className = "d-none";
    waitIconGpsInterval.className = "spinner-border d-flex justify-content-center";
    flag.resInterval = false;


    setTimeout(() => {
        if(!flag.resInterval){
            alert('Error intente otra vez');
            waitIconGpsInterval.className = "d-none";
            containerRange.className = "d-flex flex-column justify-content-center";
            customRange2.value = parseInt(gpsInterval.innerHTML); 
        }     
    }, 10000);
   

});

//#endregion



// Función para actualizar el estado del LED
function updateLEDStatus(connection, dashboard) {

    if (connection === 'Connected') {

        changeTab.click(); // cambio a la pestaña del dashboard
        led.classList.remove('led-red');
        led.classList.add('led-green');
        alert('Se Establecio la conexion');
        manageButtons(connection, dashboard);
       
      
    } else {

        led.classList.add('led-red');
        led.classList.remove('led-green');
        alert('Se Perdio la conexion');
        manageButtons(connection, dashboard);
           
    }
}

//Funcion para habilitar o deshabilitar los botones
function manageButtons(connection, enable){
   
setTimeout(() => {
    const buttons = [coverControl, deviceControl, adminOpen, remoteControlMotor, customRange2];

    if(connection == 'Connected' && enable == true){
      
        buttons.forEach(control => control.disabled = false);
        controlremoto.style.opacity = 1
        controlremoto.style.pointerEvents = 'auto';
        alert('Se Habilito el dashboard');
     
    }
    else{
        buttons.forEach(control => control.disabled = true);
        controlremoto.style.opacity = 0.5
        controlremoto.style.pointerEvents = 'none';
        alert('Se Deshabilito el dashboard')
     
    }
}, 1000);
    
}

//funcion apra obtener la fecha y la hora actual en formato normal
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
}

//funcion para convertir la fecha de formato ISO a normal
function DateConverteIso(dateISO) {
    const date = new Date(dateISO);
    const formatedDate = date.toLocaleString();

    return formatedDate;
}


