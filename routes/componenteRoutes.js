import express from 'express';
import * as componenteController from '../controllers/componente.js';
import { ensureAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.use(ensureAuthenticated);
router.get('/', componenteController.list);
router.get('/novo', componenteController.formCreate);
router.get('/:id', componenteController.view);
router.post('/', componenteController.create);
router.get('/:id/editar', componenteController.formEdit);
router.post('/:id/atualizar', componenteController.update);
router.post('/:id/deletar', componenteController.remove);

export default router;
