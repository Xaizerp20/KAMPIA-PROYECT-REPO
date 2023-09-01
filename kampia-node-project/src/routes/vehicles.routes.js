import { Router } from "express";
import { getVehicles, getVehicle, createVehicle, updateVehicle } from "../controllers/vehicles.controller.js";

const router = Router();

//metodo get para conseguir los datos de la tabla de vehiculos
router.get("/vehicles", getVehicles);

//metodo get para conseguir los datos de la tabla de vehiculos segun el dni
router.get("/vehicle/:id_owner", getVehicle);

//metodo post para crear vehiculos en la base de datos
router.post('/admin/vehicles', createVehicle);

//metodo post para asignar vehiculos en la base de datos
router.post('/admin/update-vehicle', updateVehicle)

export default router;


