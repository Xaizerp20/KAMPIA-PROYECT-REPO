const tableUsers = document.getElementById("table-users");
const tableVehicles = document.getElementById("table-vehicles");
const tableDevices = document.getElementById("table-devices");
const tableSims = document.getElementById("table-sim");
const selectUsers = document.getElementById("selectUsers");
const selectVehs = document.getElementById("selectVehs");
const vehicleDev = document.getElementById("vehicleDev");
const selectDevice = document.getElementById("selectDevice");
const selectDev = document.getElementById("selectDev");
const selectSim = document.getElementById("selectSim");
const search_user = document.getElementById("search_user");
var buttonList = {};
const options = {
    method: "GET"
};
//funcion para obtener los datos por fetch 
async function fetchData() {
    const [users, vehicles, devices, simcards] = await Promise.all([
        fetch("/users", options).then(response => response.json()),
        fetch("/vehicles", options).then(response => response.json()),
        fetch("/devices", options).then(response => response.json()),
        fetch("/sims", options).then(response => response.json()),
    ]);

    //datos usuarios
    for (let i = 0; i < users.length; i++) {

        let newRow = tableUsers.insertRow(-1);
        let id = newRow.insertCell(0);
        let DNI = newRow.insertCell(1);
        let Pass = newRow.insertCell(2);
        let Name = newRow.insertCell(3);
        let Perm = newRow.insertCell(4);

        id.innerHTML = users[i].id_user
        DNI.innerHTML = users[i].dni;
        Name.innerHTML = users[i].name;
        Pass.innerHTML = users[i].password;
        Perm.innerHTML = users[i].permission;

        const option = document.createElement("option");
        option.value = users[i].dni;
        option.text = users[i].dni;
        selectUsers.add(option);

    }
    //datos vehiculos
    for (let i = 0; i < vehicles.length; i++) {

        const veh = vehicles[i].number_plate;

        var newRowVeh = tableVehicles.insertRow(-1);
        let plate = newRowVeh.insertCell(0);
        let type = newRowVeh.insertCell(1);
        let own = newRowVeh.insertCell(2);
        let device = newRowVeh.insertCell(3);
        const option = document.createElement("option");
        const option2 = document.createElement("option");



        type.innerHTML = vehicles[i].type_vehicle;
        plate.innerHTML = veh;
        own.innerHTML = vehicles[i].id_owner
        device.innerHTML = vehicles[i].id_device

        option.value = veh;
        option.text = veh;
        option2.value = veh;
        option2.text = veh;
        selectVehs.add(option);
        vehicleDev.add(option2);
    }
    //datos dispositivos
    for (let i = 0; i < devices.length; i++) {
        let newRow = tableDevices.insertRow(-1);
        let id = newRow.insertCell(0);
        let imei = newRow.insertCell(1);
        let company = newRow.insertCell(2);
        let model = newRow.insertCell(3);
        let simCard = newRow.insertCell(4);
        let rootStatus = newRow.insertCell(5);

        id.innerHTML = devices[i].id_device;
        imei.innerHTML = devices[i].imei
        company.innerHTML = devices[i].company;
        model.innerHTML = devices[i].model;
        simCard.innerHTML = devices[i].id_simcard;
        rootStatus.innerHTML = `<button class="btn btn-primary" type="button"  style="min-width: 150px;" id = ${devices[i].imei}>${devices[i].admin_status === 'Enabled' ? 'Enabled' : 'Disabled'} </button>`

   
        buttonList[devices[i].imei] = devices[i].admin_status;



        const option = document.createElement("option");
        const option2 = document.createElement("option");
        option.value = option2.value = devices[i].id_device;
        option.text = option2.text = devices[i].imei;

        selectDevice.add(option2);
        selectDev.add(option);

    }
    //datos simCard
    for (let i = 0; i < simcards.length; i++) {

        let newRow = tableSims.insertRow(-1);
        let id = newRow.insertCell(0);
        let number = newRow.insertCell(1);
        let provider = newRow.insertCell(2);
        let phone = newRow.insertCell(3);


        id.innerHTML = simcards[i].id;
        number.innerHTML = simcards[i].number;
        provider.innerHTML = simcards[i].provider;
        phone.innerHTML = simcards[i].number_phone;


        const option = document.createElement("option");
        option.value = simcards[i].id;
        option.text = simcards[i].number;
        selectSim.add(option);

    }
}

//call fetch function
fetchData().then(() => {

    console.log(buttonList);
    

    const arrayButtons = Object.keys(buttonList);
    console.log(arrayButtons);

    arrayButtons.forEach(element => {

        const buttonDevice =  document.getElementById(element);


        buttonDevice.addEventListener('click', () => {
            console.log(`Boton Pulsado: ${element} = ${buttonList[element]}`);

            const data = buttonList[element] === 'Enabled' ? '0' : '1';

           buttonDevice.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
           Loading...`
           buttonDevice.disabled = true;

            socket.emit('MQTT', { topic: `updateRootStatus_plat/${element}`, data: `${data}` });
        })
    });

});




socket.on('admin', (data) => {


    if (data.res_updateRoot) {

        const buttonDevice =  document.getElementById(data.id);
        buttonList[data.id] = data.res_updateRoot;
        buttonDevice.innerHTML = data.res_updateRoot;
        buttonDevice.disabled = false;
        alert(`Se actualizo el estado del dispositivo ${data.id} correctamente: ${data.res_updateRoot}`);
    }
    else {
        alert(data);
    }
});






