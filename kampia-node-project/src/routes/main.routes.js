import { Router } from "express";
import pages from '../directions.js'


const router = Router();


//METODOS GET PARA ENVIAR LAS RUTAS PRINCIPALES
router.get('/', (req, res) => {
    res.redirect('/login')
})


router.get('/login', (req, res) => {
    req.session.user_id = false
    res.sendFile(pages.pageLogin)
})

router.get('/admin', (req, res) => {
    res.sendFile(pages.pageAdmin)
})

router.get('/map', (req, res) => {
    res.sendFile(pages.pageMap)
})


router.get('/isAlive', (req, res) => {
    res.sendStatus(204)
})


router.get('/logout', (req, res) => {
    res.redirect('/login');

});



export default router;