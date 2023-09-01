import { Router } from "express";
import {getAllSim, getSim, createSim, updateSimcard} from "../controllers/simcard.controller.js";

const router = Router();

//metodo get para conseguir los datos de la tabla de vehiculos
router.get("/sims", getAllSim);

router.get("/sim/:id", getSim);

router.post("/admin/sim", createSim);

router.post('/admin/update-sim', updateSimcard)

export default router;