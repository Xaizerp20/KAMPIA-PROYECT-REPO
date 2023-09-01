import { Router } from "express";
import { getData, getDataDevice, getDataStatus, lastOpenSolenoid } from "../controllers/data.controller.js";

const router = Router();

//metodo get para conseguir todos los datos del gps
router.get("/data", getData);

//metodo get para conseguir los datos de un solo dispositivo segun su id
router.get("/data/:device", getDataDevice);

//metodo get para conseguir los datos de un solo dispositivo segun su id
router.get("/dataStatus/:device", getDataStatus);

//metodo get para conseguir los datos de un solo dispositivo segun su id
router.get("/dataSolenoid/:device", lastOpenSolenoid);

export default router;
