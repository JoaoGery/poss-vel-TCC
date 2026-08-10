import express from 'express';
import { ensureAuthenticated } from '../middlewares/auth.js';
const router = express.Router();
import controller from '../controllers/controller.js'

const controle = new controller();

router.get('/', ensureAuthenticated, controle.home)
router.get('/site', ensureAuthenticated, controle.homesite)
router.post('/formulario', ensureAuthenticated, controle.formulario)

export default router
