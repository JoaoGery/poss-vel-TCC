import express from 'express';
const router = express.Router();
import controller from '../controllers/controller.js'
import manutencaoRoutes from './manutencaoRoutes.js';
import clienteRoutes from './clienteRoutes.js';
import authRoutes from './auth.js';

const controle = new controller();

router.get('/', controle.home)
router.get('/site', controle.homesite)
router.post('/formulario', controle.formulario)

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas principais
router.use('/manutencoes', manutencaoRoutes);
router.use('/clientes', clienteRoutes);

export default router