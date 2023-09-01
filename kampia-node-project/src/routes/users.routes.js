import { Router } from "express";
import { getUsers, getUserDni, createUser } from "../controllers/users.controller.js";

const router = Router();

//metodo get para conseguir todos los usuarios de la base de datos
router.get("/users", getUsers);

//metodo get para conseguir un solo usuario la base de datos
router.get("/user/:dni", getUserDni);

//METODO POST PARA AGREGAR USUARIOS  A LA BASE DE DATOS
router.post('/admin', createUser);

export default router;
