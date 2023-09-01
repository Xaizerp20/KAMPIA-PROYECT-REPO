import { Router } from "express";
import { getDevices, getDevice, createDevice, updateDevice } from "../controllers/devices.controller.js";

const router = Router();

//metodo get para conseguir los datos de la tabla de vehiculos
router.get("/devices", getDevices);

//metodo get para conseguir los datos de la tabla de vehiculos
router.get("/device/:id_device", getDevice);

//metodo post para crear dispositivos
router.post("/admin/devices", createDevice)

//metodo post para asignar los dispositivos
router.post('/admin/update-device', updateDevice)

export default router;  
