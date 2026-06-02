import express from 'express';
import * as manutencaoController from '../controllers/manutencao.js';

const router = express.Router();

// Listar todas as manutenções
router.get('/', manutencaoController.list);

// Formulário para criar nova manutenção
router.get('/novo', manutencaoController.formCreate);

// Visualizar uma manutenção específica
router.get('/:id', manutencaoController.view);

// Criar nova manutenção
router.post('/', manutencaoController.create);

// Formulário para editar manutenção
router.get('/:id/editar', manutencaoController.formEdit);

// Atualizar manutenção
router.post('/:id/atualizar', manutencaoController.update);

// Deletar manutenção
router.post('/:id/deletar', manutencaoController.remove);

export default router;
