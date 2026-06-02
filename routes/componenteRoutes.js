import express from 'express';
import * as componenteController from '../controllers/componente.js';

const router = express.Router();

// Listar todos os componentes
router.get('/', componenteController.list);

// Formulário para criar novo componente
router.get('/novo', componenteController.formCreate);

// Visualizar um componente específico
router.get('/:id', componenteController.view);

// Criar novo componente
router.post('/', componenteController.create);

// Formulário para editar componente
router.get('/:id/editar', componenteController.formEdit);

// Atualizar componente
router.post('/:id/atualizar', componenteController.update);

// Deletar componente
router.post('/:id/deletar', componenteController.remove);

export default router;
