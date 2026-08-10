import express from 'express';
import * as manutencaoController from '../controllers/manutencao.js';
import { ensureAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.use(ensureAuthenticated);
router.get('/', manutencaoController.list);
router.get('/novo', manutencaoController.formCreate);
router.get('/:id', manutencaoController.view);
router.post('/', manutencaoController.create);
router.get('/:id/editar', manutencaoController.formEdit);
router.post('/:id/atualizar', manutencaoController.update);
router.post('/:id/deletar', manutencaoController.remove);

export default router;
