import express from 'express';
import * as clienteController from '../controllers/cliente.js';

const router = express.Router();

router.get('/', clienteController.list);
router.get(['/novo', '/add'], clienteController.formCreate);
router.post(['/', '/add'], clienteController.create);
router.get(['/:id/editar', '/editar/:id', '/edit/:id'], clienteController.formEdit);
router.post(['/:id/atualizar', '/editar/:id', '/edit/:id'], clienteController.update);
router.post(['/:id/deletar', '/excluir/:id'], clienteController.remove);
router.get('/:id', clienteController.view);

export default router;
