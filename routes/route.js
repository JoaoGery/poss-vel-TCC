import express from 'express';
const router = express.Router();
import controller from '../controllers/controller.js'

const controle = new controller();

router.get('/', controle.home)
router.get('/site', controle.homesite)
router.post('/formulario', controle.formulario)

export default router
